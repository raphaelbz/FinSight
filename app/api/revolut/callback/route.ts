import { NextRequest, NextResponse } from 'next/server'
import { revolutAPI } from '@/lib/revolut'
import { getServerSession } from 'next-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  try {
    // Check if user is authenticated
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.redirect(`${baseUrl}/login?error=unauthorized`)
    }

    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    // Check for OAuth errors
    if (error) {
      console.error('Revolut OAuth error:', error)
      return NextResponse.redirect(`${baseUrl}/dashboard?error=revolut_auth_failed`)
    }

    if (!code || !state) {
      return NextResponse.redirect(`${baseUrl}/dashboard?error=missing_parameters`)
    }

    // Verify state parameter
    const storedState = request.cookies.get('revolut_state')?.value
    if (!storedState || storedState !== state) {
      console.error('State mismatch:', { stored: storedState, received: state })
      return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_state`)
    }

    try {
      // Exchange code for access token
      const tokenResponse = await revolutAPI.exchangeCodeForToken(code)
      
      // Get user accounts
      const accounts = await revolutAPI.getAccounts(tokenResponse.access_token)
      
      if (accounts.length === 0) {
        return NextResponse.redirect(`${baseUrl}/dashboard?error=no_accounts`)
      }

      // Get transactions for the first account
      const primaryAccount = accounts[0]
      const fromDate = new Date()
      fromDate.setMonth(fromDate.getMonth() - 3) // Last 3 months
      
      const transactions = await revolutAPI.getTransactions(
        tokenResponse.access_token,
        primaryAccount.accountId,
        fromDate.toISOString(),
        new Date().toISOString()
      )

      // Store the data securely (in production, use encrypted database)
      // For now, we'll pass it via URL parameters to the success page
      const userData = {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        expiresIn: tokenResponse.expires_in,
        account: primaryAccount,
        transactions: transactions.slice(0, 10) // Last 10 transactions
      }

      // In production, store this data in your database associated with the user
      // For demo purposes, we'll pass minimal data via URL
      const response = NextResponse.redirect(`${baseUrl}/dashboard?connected=revolut&status=success`)
      
      // Clear the state cookies
      response.cookies.delete('revolut_state')
      response.cookies.delete('revolut_nonce')
      
      // Store encrypted token data (in production, use proper encryption)
      response.cookies.set('revolut_data', JSON.stringify(userData), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 3600 // 1 hour
      })

      return response
    } catch (apiError) {
      console.error('Revolut API error:', apiError)
      return NextResponse.redirect(`${baseUrl}/dashboard?error=api_failed`)
    }
  } catch (error) {
    console.error('Callback error:', error)
    return NextResponse.redirect(`${baseUrl}/dashboard?error=internal_error`)
  }
} 