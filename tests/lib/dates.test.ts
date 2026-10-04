import { describe, it, expect } from 'vitest'
import { formatDateBR } from '@/lib/dates'

describe('formatDateBR', () => {
  it('converte aaaa-mm-dd em dd/mm/aaaa', () => {
    expect(formatDateBR('2026-09-30')).toBe('30/09/2026')
  })
  it('não desloca o dia por fuso horário', () => {
    expect(formatDateBR('2026-01-01')).toBe('01/01/2026')
    expect(formatDateBR('2026-12-31')).toBe('31/12/2026')
  })
  it('entrada inválida ou vazia devolve o texto original', () => {
    expect(formatDateBR('')).toBe('')
    expect(formatDateBR('ontem')).toBe('ontem')
    expect(formatDateBR('2026-9-3')).toBe('2026-9-3')
  })
})
