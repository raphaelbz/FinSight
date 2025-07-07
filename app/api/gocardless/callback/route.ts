import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { goCardlessAPI } from '@/lib/gocardless'

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
    const requisitionId = searchParams.get('requisition_id') || searchParams.get('ref')
    const error = searchParams.get('error')

    console.log('GoCardless callback received:', {
      requisitionId,
      error,
      userEmail: session.user.email
    })

    // Check for OAuth errors
    if (error) {
      console.error('GoCardless authorization error:', error)
      return NextResponse.redirect(
        `${baseUrl}/dashboard/add-account?error=authorization_failed&message=${encodeURIComponent('Bank authorization was cancelled or failed')}`
      )
    }

    if (!requisitionId) {
      console.error('No requisition ID in callback')
      return NextResponse.redirect(
        `${baseUrl}/dashboard/add-account?error=missing_data&message=${encodeURIComponent('Invalid callback - missing requisition ID')}`
      )
    }

    // Get requisition status
    const requisition = await goCardlessAPI.getRequisition(requisitionId)
    
    console.log('Requisition status:', {
      id: requisition.id,
      status: requisition.status,
      accounts: requisition.accounts?.length || 0
    })

    // Check if requisition is successfully linked
    if (requisition.status === 'LN' && requisition.accounts?.length > 0) {
      // Success! Redirect to dashboard with success message
      return NextResponse.redirect(
        `${baseUrl}/dashboard/add-account?success=true&message=${encodeURIComponent('Bank account connected successfully!')}&requisition_id=${requisitionId}`
      )
    } else if (requisition.status === 'CR') {
      // Created but not yet linked - might be in progress
      return NextResponse.redirect(
        `${baseUrl}/dashboard/add-account?warning=true&message=${encodeURIComponent('Connection in progress. Please complete the authorization in your banking app.')}&requisition_id=${requisitionId}`
      )
    } else if (requisition.status === 'RJ') {
      // Rejected
      return NextResponse.redirect(
        `${baseUrl}/dashboard/add-account?error=rejected&message=${encodeURIComponent('Bank authorization was rejected. Please try again.')}`
      )
    } else if (requisition.status === 'EX') {
      // Expired
      return NextResponse.redirect(
        `${baseUrl}/dashboard/add-account?error=expired&message=${encodeURIComponent('Authorization link has expired. Please start over.')}`
      )
    } else {
      // Other status
      return NextResponse.redirect(
        `${baseUrl}/dashboard/add-account?warning=true&message=${encodeURIComponent(`Connection status: ${requisition.status}. Please try again if needed.`)}&requisition_id=${requisitionId}`
      )
    }

  } catch (error: any) {
    console.error('GoCardless callback error:', error)

    return NextResponse.redirect(
      `${baseUrl}/dashboard/add-account?error=callback_failed&message=${encodeURIComponent('Failed to process bank authorization. Please try again.')}`
    )
  }
} 