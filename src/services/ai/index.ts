import { OllamaProvider } from './ollamaProvider'
import { GroqProvider } from './groqProvider'
import type { AIProvider } from './types'

export function getAIProvider(): AIProvider {
  return process.env.AI_PROVIDER === 'groq' ? new GroqProvider() : new OllamaProvider()
}

export * from './types'
