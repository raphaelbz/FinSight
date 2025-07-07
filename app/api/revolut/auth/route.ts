import { NextRequest, NextResponse } from 'next/server'
import { revolutAPI } from '@/lib/revolut'
import { getServerSession } from 'next-auth'
import { v4 as uuidv4 } from 'uuid'

export async function GET(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Generate state and nonce for security
    const state = uuidv4()
    const nonce = uuidv4()
    
    // Store state in session/cookie for validation later
    const response = NextResponse.redirect(
      revolutAPI.getAuthorizationUrl(state, nonce)
    )
    
    // Set secure cookies with state and nonce
    response.cookies.set('revolut_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })
    
    response.cookies.set('revolut_nonce', nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minutes
    })

    return response
  } catch (error) {
    console.error('Revolut auth error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 