import { toast } from 'sonner'
import type { Config } from '@/types'
import type { ConfigRepository } from './types'
import { demoConfig } from '@/lib/demoSeed'

const STORAGE_KEY = 'finance-agent:demo:config'
let memoryFallback: Config | null = null

function readStored(): Config {
  if (typeof window === 'undefined') return demoConfig
  if (memoryFallback !== null) return memoryFallback

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (raw === null) {
    writeStored(demoConfig)
    return demoConfig
  }
  try {
    return JSON.parse(raw) as Config
  } catch {
    return demoConfig
  }
}

function writeStored(config: Config): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    memoryFallback = null
  } catch {
    memoryFallback = config
    toast.error('Não foi possível salvar no navegador — as preferências vão se perder ao recarregar a página.')
  }
}

export class LocalConfigRepository implements ConfigRepository {
  async read(): Promise<Config> {
    return readStored()
  }

  async update(patch: Partial<Config>): Promise<Config> {
    const updated = { ...readStored(), ...patch }
    writeStored(updated)
    return updated
  }
}
