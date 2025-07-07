import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

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

    // Get Revolut data from cookies
    const revolutDataCookie = request.cookies.get('revolut_data')?.value
    
    if (!revolutDataCookie) {
      return NextResponse.json(
        { connected: false, message: 'No Revolut account connected' },
        { status: 200 }
      )
    }

    try {
      const userData = JSON.parse(revolutDataCookie)
      
      // Transform data to match our frontend format
      const transformedData = {
        connected: true,
        accountName: userData.account?.nickname || 'Revolut Personal',
        balance: parseFloat(userData.account?.balances?.[0]?.amount || '0'),
        currency: userData.account?.currency || 'EUR',
        transactions: userData.transactions?.map((tx: any) => ({
          id: tx.transactionId,
          description: tx.transactionInformation || tx.merchantDetails?.merchantName || 'Transaction',
          amount: parseFloat(tx.amount.amount) * (tx.creditDebitIndicator === 'Debit' ? -1 : 1),
          date: tx.bookingDateTime,
          category: mapTransactionCategory(tx)
        })) || [],
        connectedAt: new Date().toISOString()
      }

      return NextResponse.json(transformedData)
    } catch (parseError) {
      console.error('Error parsing Revolut data:', parseError)
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Data fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Clear Revolut data
    const response = NextResponse.json({ success: true })
    response.cookies.delete('revolut_data')

    return response
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function mapTransactionCategory(transaction: any): string {
  const merchantName = transaction.merchantDetails?.merchantName?.toLowerCase() || ''
  const info = transaction.transactionInformation?.toLowerCase() || ''
  
  if (merchantName.includes('spotify') || merchantName.includes('netflix') || merchantName.includes('youtube')) {
    return 'Entertainment'
  }
  if (merchantName.includes('supermarket') || merchantName.includes('grocery') || info.includes('food')) {
    return 'Groceries'
  }
  if (merchantName.includes('restaurant') || merchantName.includes('cafe') || info.includes('dining')) {
    return 'Dining'
  }
  if (merchantName.includes('gas') || merchantName.includes('fuel') || info.includes('transport')) {
    return 'Transport'
  }
  if (transaction.creditDebitIndicator === 'Credit' && parseFloat(transaction.amount.amount) > 1000) {
    return 'Income'
  }
  
  return 'Other'
} 