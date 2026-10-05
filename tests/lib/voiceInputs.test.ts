import { describe, it, expect } from 'vitest'
import { buildTransactionInputs } from '@/lib/voiceInputs'
import type { ParsedVoice } from '@/types'

const parsed = (p: Partial<ParsedVoice>): ParsedVoice => ({
  descricao: 'Nike', valor: 4500, pagamento: 'parcelado', tipo: 'gasto', ...p,
})
const montar = (p: ParsedVoice) => buildTransactionInputs(p, 'Compras', '2026-10-05', 'voz')

describe('buildTransactionInputs', () => {
  it('parcelado com número de parcelas vira N lançamentos mensais do valor total', () => {
    const out = montar(parsed({ parcelas: 12 }))
    expect(out).toHaveLength(12)
    expect(out[0]).toMatchObject({
      descricao: 'Nike (1/12)', valor: 375, data: '2026-10-05', pagamento: 'parcelado',
      parcelas: 12, categoria: 'Compras', tipo: 'gasto', origem: 'voz',
    })
    expect(out[11]).toMatchObject({ descricao: 'Nike (12/12)', data: '2027-09-05' })
    expect(Math.round(out.reduce((s, i) => s + i.valor * 100, 0))).toBe(450000)
  })

  it('parcelado sem número de parcelas continua sendo um único lançamento', () => {
    const out = montar(parsed({ parcelas: undefined }))
    expect(out).toEqual([
      { tipo: 'gasto', descricao: 'Nike', valor: 4500, categoria: 'Compras', pagamento: 'parcelado', data: '2026-10-05', origem: 'voz' },
    ])
  })

  it('uma só parcela, ou número fora do limite, não divide a compra', () => {
    for (const parcelas of [1, 0, 61, 99]) {
      const out = montar(parsed({ parcelas }))
      expect(out, `${parcelas}x`).toHaveLength(1)
      expect(out[0].valor).toBe(4500)
      expect(out[0].descricao).toBe('Nike')
    }
  })

  it('outras formas de pagamento viram um único lançamento', () => {
    const out = montar(parsed({ pagamento: 'pix', valor: 30, descricao: 'Padaria' }))
    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({ descricao: 'Padaria', valor: 30, pagamento: 'pix' })
    expect(out[0].parcelas).toBeUndefined()
  })

  it('o centavo de arredondamento fica na última parcela', () => {
    const out = montar(parsed({ valor: 100, parcelas: 3 }))
    expect(out.map((i) => i.valor)).toEqual([33.33, 33.33, 33.34])
  })

  it('as parcelas da mesma compra saem com o mesmo grupo, e compras diferentes com grupos diferentes', () => {
    const a = montar(parsed({ parcelas: 12 }))
    const b = montar(parsed({ parcelas: 12 }))
    const grupo = a[0].grupoParcelas
    expect(grupo).toBeTruthy()
    expect(a.every((i) => i.grupoParcelas === grupo)).toBe(true)
    expect(b[0].grupoParcelas).not.toBe(grupo)
  })

  it('lançamento sem parcelas não tem grupo', () => {
    expect(montar(parsed({ parcelas: undefined }))[0].grupoParcelas).toBeUndefined()
    expect(montar(parsed({ pagamento: 'pix' }))[0].grupoParcelas).toBeUndefined()
  })
})
