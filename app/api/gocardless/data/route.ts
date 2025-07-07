import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { goCardlessAPI } from '@/lib/gocardless'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    const { searchParams } = new URL(request.url)
    const requisitionId = searchParams.get('requisition_id')

    if (!requisitionId) {
      return NextResponse.json(
        { error: 'Missing requisition_id parameter' },
        { status: 400 }
      )
    }

    console.log(`Fetching bank data for ${session.user.email}, requisition: ${requisitionId}`)

    // Get connected account data
    const accountData = await goCardlessAPI.getConnectedAccountData(requisitionId)

    if (!accountData.accounts || accountData.accounts.length === 0) {
      return NextResponse.json(
        { 
          error: 'No accounts found',
          message: 'No bank accounts were found for this connection. Please try connecting again.'
        },
        { status: 404 }
      )
    }

    // Transform data to match expected format
    const transformedData = {
      institution: accountData.institution,
      connectedAt: new Date().toISOString(),
      accounts: accountData.accounts.map(account => ({
        id: account.id,
        iban: account.details.iban,
        name: account.details.name || account.details.displayName || `${accountData.institution} Account`,
        currency: account.details.currency,
        ownerName: account.details.ownerName,
        product: account.details.product,
        balances: account.balances.map(balance => ({
          amount: parseFloat(balance.balanceAmount.amount),
          currency: balance.balanceAmount.currency,
          type: balance.balanceType,
          date: balance.referenceDate || new Date().toISOString().split('T')[0]
        })),
        transactions: account.transactions.map(transaction => ({
          id: transaction.transactionId,
          amount: parseFloat(transaction.transactionAmount.amount),
          currency: transaction.transactionAmount.currency,
          date: transaction.bookingDate,
          valueDate: transaction.valueDate,
          description: transaction.remittanceInformationUnstructured || 'Transaction',
          debtorName: transaction.debtorName,
          creditorName: transaction.creditorName,
          debtorIban: transaction.debtorAccount?.iban,
          creditorIban: transaction.creditorAccount?.iban,
          bankTransactionCode: transaction.bankTransactionCode,
          pending: (transaction as any).pending || false
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date descending
      }))
    }

    console.log(`Successfully fetched data for ${accountData.accounts.length} accounts from ${accountData.institution}`)

    return NextResponse.json({
      success: true,
      data: transformedData,
      summary: {
        institution: accountData.institution,
        accountCount: accountData.accounts.length,
        totalTransactions: transformedData.accounts.reduce((sum, acc) => sum + acc.transactions.length, 0),
        fetchedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('GoCardless data fetch error:', error)

    // Handle specific error cases
    if (error.message.includes('Requisition not ready')) {
      return NextResponse.json(
        { 
          error: 'Connection not ready',
          message: 'Bank connection is not yet ready. Please complete the authorization process or try again in a few moments.',
          status: 'pending'
        },
        { status: 202 }
      )
    }

    if (error.message.includes('not found') || error.message.includes('404')) {
      return NextResponse.json(
        { 
          error: 'Connection not found',
          message: 'Bank connection not found. Please reconnect your bank account.'
        },
        { status: 404 }
      )
    }

    if (error.message.includes('access_expired') || error.message.includes('expired')) {
      return NextResponse.json(
        { 
          error: 'Access expired',
          message: 'Bank access has expired. Please reconnect your bank account.'
        },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Data fetch failed',
        message: 'Failed to retrieve bank data. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
} 