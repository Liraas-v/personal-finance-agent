// tests/lib/parser.test.ts
import { describe, it, expect } from 'vitest'
import { parseVoiceInput } from '@/lib/parser'

describe('parseVoiceInput', () => {
  it('parses "ifood 42 reais"', () => {
    const result = parseVoiceInput('ifood 42 reais')
    expect(result).toMatchObject({ descricao: 'Ifood', valor: 42, tipo: 'gasto', pagamento: 'crédito' })
  })

  it('parses "uber 19"', () => {
    const result = parseVoiceInput('uber 19')
    expect(result).toMatchObject({ valor: 19, tipo: 'gasto' })
  })

  it('parses "mercado 120 no débito"', () => {
    const result = parseVoiceInput('mercado 120 no débito')
    expect(result).toMatchObject({ valor: 120, pagamento: 'débito' })
  })

  it('parses "nike 300 parcelado"', () => {
    const result = parseVoiceInput('nike 300 parcelado')
    expect(result).toMatchObject({ valor: 300, pagamento: 'parcelado' })
  })

  it('parses "salário 6200" as receita', () => {
    const result = parseVoiceInput('salário 6200')
    expect(result).toMatchObject({ valor: 6200, tipo: 'receita', pagamento: 'pix' })
  })

  it('parses "netflix 21,90" with decimal comma', () => {
    const result = parseVoiceInput('netflix 21,90')
    expect(result).toMatchObject({ valor: 21.9 })
  })

  it('returns null when no number found', () => {
    expect(parseVoiceInput('sem valor')).toBeNull()
  })

  it('parses "iphone 4500 em 12 vezes"', () => {
    const result = parseVoiceInput('iphone 4500 em 12 vezes')
    expect(result).toMatchObject({ valor: 4500, pagamento: 'parcelado', parcelas: 12 })
  })
})
