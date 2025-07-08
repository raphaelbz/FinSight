import { prisma } from './prisma'
import { saltEdgeClient, SaltEdgeAccount, SaltEdgeTransaction } from './saltedge'

// ──────────────────────────────────────────────────────────────
// Gestion des utilisateurs et Salt Edge Info
// ──────────────────────────────────────────────────────────────

export async function getOrCreateUser(email: string, name?: string) {
  return await prisma.user.upsert({
    where: { email },
    create: { email, name },
    update: { name },
  })
}

export async function getOrCreateSaltEdgeInfo(email: string) {
  // Chercher d'abord si l'info existe
  const existing = await prisma.saltEdgeInfo.findFirst({
    where: { user: { email } },
    include: { user: true },
  })
  
  if (existing) return existing

  // Créer l'utilisateur et l'info Salt Edge
  const user = await getOrCreateUser(email)
  
  const saltEdgeInfo = await prisma.saltEdgeInfo.create({
    data: {
      userId: user.id,
      customerId: `finsight_${email}_${Date.now()}`, // Identifiant unique
      status: 'pending',
    },
  })

  return saltEdgeInfo
}

export async function updateSaltEdgeConnection(
  customerId: string, 
  connectionId: string, 
  providerName?: string
) {
  return await prisma.saltEdgeInfo.update({
    where: { customerId },
    data: {
      connectionId,
      providerName,
      status: 'active',
      lastSyncAt: new Date(),
    },
  })
}

export async function getSaltEdgeInfoByEmail(email: string) {
  return await prisma.saltEdgeInfo.findFirst({
    where: { user: { email } },
    include: { user: true },
  })
}

export async function getSaltEdgeInfoByCustomerId(customerId: string) {
  return await prisma.saltEdgeInfo.findUnique({
    where: { customerId },
    include: { user: true },
  })
}

// ──────────────────────────────────────────────────────────────
// Gestion des comptes bancaires
// ──────────────────────────────────────────────────────────────

export async function upsertAccount(
  userId: string,
  connectionId: string,
  saltEdgeAccount: SaltEdgeAccount
) {
  return await prisma.account.upsert({
    where: { id: saltEdgeAccount.id },
    create: {
      id: saltEdgeAccount.id,
      userId,
      connectionId,
      name: saltEdgeAccount.name,
      nature: saltEdgeAccount.nature,
      balance: saltEdgeAccount.balance,
      currency: saltEdgeAccount.currency_code,
      iban: saltEdgeAccount.extra.iban,
      accountNumber: saltEdgeAccount.extra.account_number,
      sortCode: saltEdgeAccount.extra.sort_code,
      swiftCode: saltEdgeAccount.extra.swift_code,
    },
    update: {
      name: saltEdgeAccount.name,
      nature: saltEdgeAccount.nature,
      balance: saltEdgeAccount.balance,
      currency: saltEdgeAccount.currency_code,
      iban: saltEdgeAccount.extra.iban,
      accountNumber: saltEdgeAccount.extra.account_number,
      sortCode: saltEdgeAccount.extra.sort_code,
      swiftCode: saltEdgeAccount.extra.swift_code,
      updatedAt: new Date(),
    },
  })
}

export async function getUserAccounts(email: string) {
  return await prisma.account.findMany({
    where: { user: { email } },
    orderBy: { createdAt: 'desc' },
  })
}

// ──────────────────────────────────────────────────────────────
// Gestion des transactions
// ──────────────────────────────────────────────────────────────

export async function upsertTransaction(saltEdgeTransaction: SaltEdgeTransaction) {
  return await prisma.transaction.upsert({
    where: { id: saltEdgeTransaction.id },
    create: {
      id: saltEdgeTransaction.id,
      accountId: saltEdgeTransaction.account_id,
      description: saltEdgeTransaction.description,
      amount: saltEdgeTransaction.amount,
      currency: saltEdgeTransaction.currency_code,
      madeOn: new Date(saltEdgeTransaction.made_on),
      category: saltEdgeTransaction.category,
      mode: saltEdgeTransaction.mode,
      status: saltEdgeTransaction.status,
      duplicated: saltEdgeTransaction.duplicated,
      balance: saltEdgeTransaction.extra.account_balance_snapshot,
      postingDate: saltEdgeTransaction.extra.posting_date 
        ? new Date(saltEdgeTransaction.extra.posting_date) 
        : null,
      merchantId: saltEdgeTransaction.extra.merchant_id,
    },
    update: {
      description: saltEdgeTransaction.description,
      amount: saltEdgeTransaction.amount,
      currency: saltEdgeTransaction.currency_code,
      madeOn: new Date(saltEdgeTransaction.made_on),
      category: saltEdgeTransaction.category,
      mode: saltEdgeTransaction.mode,
      status: saltEdgeTransaction.status,
      duplicated: saltEdgeTransaction.duplicated,
      balance: saltEdgeTransaction.extra.account_balance_snapshot,
      postingDate: saltEdgeTransaction.extra.posting_date 
        ? new Date(saltEdgeTransaction.extra.posting_date) 
        : null,
      merchantId: saltEdgeTransaction.extra.merchant_id,
      updatedAt: new Date(),
    },
  })
}

export async function getUserTransactions(email: string, limit: number = 100) {
  return await prisma.transaction.findMany({
    where: { 
      account: { 
        user: { email } 
      } 
    },
    orderBy: { madeOn: 'desc' },
    take: limit,
    include: {
      account: {
        select: {
          name: true,
          currency: true,
        }
      }
    }
  })
}

export async function getAccountTransactions(accountId: string, limit: number = 100) {
  return await prisma.transaction.findMany({
    where: { accountId },
    orderBy: { madeOn: 'desc' },
    take: limit,
  })
}

// ──────────────────────────────────────────────────────────────
// Synchronisation complète des données Salt Edge
// ──────────────────────────────────────────────────────────────

export async function syncSaltEdgeData(connectionId: string) {
  const errors: string[] = []
  let accounts: any[] = []
  let transactions: any[] = []

  try {
    // 1. Récupérer les informations de connexion
    const connection = await saltEdgeClient.getConnection(connectionId)
    
    // 2. Trouver l'utilisateur associé
    const saltEdgeInfo = await getSaltEdgeInfoByCustomerId(connection.customer_id)
    if (!saltEdgeInfo) {
      throw new Error(`No user found for customer_id: ${connection.customer_id}`)
    }

    // 3. Synchroniser les comptes
    try {
      const saltEdgeAccounts = await saltEdgeClient.getAccounts(connectionId)
      
      for (const saltEdgeAccount of saltEdgeAccounts) {
        try {
          const account = await upsertAccount(
            saltEdgeInfo.userId, 
            connectionId, 
            saltEdgeAccount
          )
          accounts.push(account)
        } catch (error) {
          console.error(`Error upserting account ${saltEdgeAccount.id}:`, error)
          errors.push(`Account ${saltEdgeAccount.name}: ${error}`)
        }
      }
    } catch (error) {
      console.error('Error fetching accounts:', error)
      errors.push(`Accounts: ${error}`)
    }

    // 4. Synchroniser les transactions
    try {
      const saltEdgeTransactions = await saltEdgeClient.getConnectionTransactions(connectionId)
      
      for (const saltEdgeTransaction of saltEdgeTransactions) {
        try {
          const transaction = await upsertTransaction(saltEdgeTransaction)
          transactions.push(transaction)
        } catch (error) {
          console.error(`Error upserting transaction ${saltEdgeTransaction.id}:`, error)
          errors.push(`Transaction ${saltEdgeTransaction.id}: ${error}`)
        }
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
      errors.push(`Transactions: ${error}`)
    }

    // 5. Mettre à jour le statut de synchronisation
    await prisma.saltEdgeInfo.update({
      where: { id: saltEdgeInfo.id },
      data: { 
        lastSyncAt: new Date(),
        status: 'active' 
      },
    })

  } catch (error) {
    console.error('Error in syncSaltEdgeData:', error)
    errors.push(`Sync: ${error}`)
  }

  return { accounts, transactions, errors }
}

// ──────────────────────────────────────────────────────────────
// Logs de synchronisation
// ──────────────────────────────────────────────────────────────

export async function createSyncLog(
  userId: string,
  connectionId: string | null,
  action: string,
  status: 'success' | 'error' | 'pending',
  message?: string,
  duration?: number
) {
  return await prisma.syncLog.create({
    data: {
      userId,
      connectionId,
      action,
      status,
      message,
      duration,
    },
  })
}

export async function getUserSyncLogs(email: string, limit: number = 50) {
  const users = await prisma.user.findMany({
    where: { email },
    select: { id: true }
  })
  
  return await prisma.syncLog.findMany({
    where: { 
      userId: {
        in: users.map((u: any) => u.id)
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

// ──────────────────────────────────────────────────────────────
// Utilitaires de nettoyage
// ──────────────────────────────────────────────────────────────

export async function deleteUserData(email: string): Promise<void> {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return

  // Prisma va gérer les cascades
  await prisma.user.delete({ where: { id: user.id } })
}

export async function getUserBankingData(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      saltEdge: true,
      accounts: {
        include: {
          transactions: {
            orderBy: { madeOn: 'desc' },
            take: 50, // Dernières 50 transactions
          }
        }
      }
    }
  })

  return user
} 