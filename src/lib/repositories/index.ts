import { ApiTransactionRepository } from './apiTransactionRepository'
import { LocalTransactionRepository } from './localTransactionRepository'
import { ApiConfigRepository } from './apiConfigRepository'
import { LocalConfigRepository } from './localConfigRepository'
import type { TransactionRepository, ConfigRepository } from './types'

const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo'

export function getTransactionRepository(): TransactionRepository {
  return isDemoMode ? new LocalTransactionRepository() : new ApiTransactionRepository()
}

export function getConfigRepository(): ConfigRepository {
  return isDemoMode ? new LocalConfigRepository() : new ApiConfigRepository()
}

export * from './types'
