import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { goCardlessAPI } from '@/lib/gocardless'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    const { bankName = 'revolut' } = await request.json()

    console.log(`Starting bank connection for ${session.user.email} with ${bankName}`)

    // Start bank connection flow
    const connectionData = await goCardlessAPI.startBankConnection(
      bankName, 
      session.user.email
    )

    console.log(`Connection initiated for ${bankName}:`, {
      requisitionId: connectionData.requisitionId,
      institutionName: connectionData.institutionName
    })

    return NextResponse.json({
      success: true,
      authUrl: connectionData.link,
      requisitionId: connectionData.requisitionId,
      institutionName: connectionData.institutionName,
      message: `Please complete the authorization with ${connectionData.institutionName}`
    })

  } catch (error: any) {
    console.error('GoCardless auth initiation error:', error)

    // Handle specific GoCardless errors
    if (error.message.includes('Institution') && error.message.includes('not found')) {
      return NextResponse.json(
        { 
          error: 'Bank not supported',
          message: 'The selected bank is not available through our service. Please try a different bank or contact support.'
        },
        { status: 400 }
      )
    }

    if (error.message.includes('Failed to get access token')) {
      return NextResponse.json(
        { 
          error: 'Service configuration error',
          message: 'Our banking service is temporarily unavailable. Please try again later.'
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Connection failed',
        message: 'Failed to initiate bank connection. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
} 