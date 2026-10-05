import { describe, it, expect } from 'vitest'
import { splitInstallments, MAX_PARCELAS } from '@/lib/installments'

const soma = (xs: { valor: number }[]) => Math.round(xs.reduce((s, x) => s + x.valor * 100, 0)) / 100

describe('splitInstallments — valores', () => {
  it('divide o total em partes iguais quando é exato', () => {
    const out = splitInstallments({ total: 4500, parcelas: 12, primeiraData: '2026-10-05', descricao: 'Nike' })
    expect(out).toHaveLength(12)
    expect(out.every((p) => p.valor === 375)).toBe(true)
  })

  it('o centavo que sobra vai para a última parcela e a soma fecha exatamente', () => {
    const out = splitInstallments({ total: 100, parcelas: 3, primeiraData: '2026-10-05', descricao: 'x' })
    expect(out.map((p) => p.valor)).toEqual([33.33, 33.33, 33.34])
    expect(soma(out)).toBe(100)
  })

  it('a soma bate com o total em vários casos difíceis', () => {
    for (const [total, n] of [[0.1, 3], [99.99, 7], [1234.56, 11], [0.05, 2], [10, 6]] as const) {
      const out = splitInstallments({ total, parcelas: n, primeiraData: '2026-01-10', descricao: 'x' })
      expect(soma(out), `${total} em ${n}x`).toBe(total)
      expect(out.every((p) => p.valor >= 0)).toBe(true)
    }
  })
})

describe('splitInstallments — datas', () => {
  it('uma parcela por mês, no mesmo dia', () => {
    const out = splitInstallments({ total: 300, parcelas: 3, primeiraData: '2026-10-05', descricao: 'x' })
    expect(out.map((p) => p.data)).toEqual(['2026-10-05', '2026-11-05', '2026-12-05'])
  })

  it('vira o ano corretamente', () => {
    const out = splitInstallments({ total: 300, parcelas: 3, primeiraData: '2026-11-15', descricao: 'x' })
    expect(out.map((p) => p.data)).toEqual(['2026-11-15', '2026-12-15', '2027-01-15'])
  })

  it('dia 31 cai no último dia dos meses curtos, sem derivar nos meses seguintes', () => {
    const out = splitInstallments({ total: 400, parcelas: 4, primeiraData: '2026-01-31', descricao: 'x' })
    expect(out.map((p) => p.data)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31', '2026-04-30'])
  })

  it('fevereiro de ano bissexto tem 29 dias', () => {
    const out = splitInstallments({ total: 200, parcelas: 2, primeiraData: '2028-01-31', descricao: 'x' })
    expect(out.map((p) => p.data)).toEqual(['2028-01-31', '2028-02-29'])
  })
})

describe('splitInstallments — descrição e validação', () => {
  it('acrescenta (i/N) à descrição e informa o total de parcelas', () => {
    const out = splitInstallments({ total: 300, parcelas: 3, primeiraData: '2026-10-05', descricao: 'Nike' })
    expect(out.map((p) => p.descricao)).toEqual(['Nike (1/3)', 'Nike (2/3)', 'Nike (3/3)'])
    expect(out.every((p) => p.parcelas === 3)).toBe(true)
  })

  it('1 parcela vira um único lançamento, sem sufixo', () => {
    const out = splitInstallments({ total: 80, parcelas: 1, primeiraData: '2026-10-05', descricao: 'Livro' })
    expect(out).toEqual([{ descricao: 'Livro', valor: 80, data: '2026-10-05', parcelas: 1 }])
  })

  it('rejeita número de parcelas inválido', () => {
    for (const parcelas of [0, -2, 1.5, NaN, MAX_PARCELAS + 1]) {
      expect(() => splitInstallments({ total: 100, parcelas, primeiraData: '2026-10-05', descricao: 'x' })).toThrow(RangeError)
    }
  })

  it('rejeita total inválido e data inválida', () => {
    expect(() => splitInstallments({ total: 0, parcelas: 2, primeiraData: '2026-10-05', descricao: 'x' })).toThrow(RangeError)
    expect(() => splitInstallments({ total: -5, parcelas: 2, primeiraData: '2026-10-05', descricao: 'x' })).toThrow(RangeError)
    expect(() => splitInstallments({ total: 100, parcelas: 2, primeiraData: 'ontem', descricao: 'x' })).toThrow(RangeError)
  })

  it('não permite que o total seja menor que 1 centavo por parcela', () => {
    expect(() => splitInstallments({ total: 0.05, parcelas: 6, primeiraData: '2026-10-05', descricao: 'x' })).toThrow(RangeError)
  })
})
