import { describe, it, expect } from 'vitest'
import { splitInstallments } from '@/lib/installments'
import {
  descricaoBase,
  parcelasDoGrupo,
  parcelasFuturas,
  planejarEdicaoDoGrupo,
} from '@/lib/installmentGroups'
import type { Transaction } from '@/types'

function compra(total: number, n: number, primeiraData = '2026-10-05', grupo = 'g1', descricao = 'Nike'): Transaction[] {
  return splitInstallments({ total, parcelas: n, primeiraData, descricao, grupoParcelas: grupo }).map((p, i) => ({
    id: `${grupo}-${i + 1}`,
    tipo: 'gasto',
    categoria: 'Compras',
    pagamento: 'parcelado',
    origem: 'manual',
    createdAt: '2026-10-05T12:00:00.000Z',
    ...p,
  }))
}

const centavos = (xs: { valor: number }[]) => Math.round(xs.reduce((s, x) => s + x.valor * 100, 0))

// Aplica o plano ao grupo e devolve o estado resultante, como o armazenamento ficaria.
function aplicar(parcelas: Transaction[], plano: ReturnType<typeof planejarEdicaoDoGrupo>) {
  const removidos = new Set(plano.remover)
  const atualizadas = parcelas
    .filter((p) => !removidos.has(p.id))
    .map((p) => {
      const a = plano.atualizar.find((x) => x.id === p.id)
      return a ? { ...p, ...a.patch } : p
    })
  return [...atualizadas, ...plano.criar]
}

describe('descricaoBase', () => {
  it('tira o sufixo (i/N) e preserva o resto', () => {
    expect(descricaoBase('Nike (3/12)')).toBe('Nike')
    expect(descricaoBase('Mercado (Livre) (1/3)')).toBe('Mercado (Livre)')
    expect(descricaoBase('Sem sufixo')).toBe('Sem sufixo')
  })
})

describe('parcelasDoGrupo', () => {
  it('ignora lançamentos sem grupo e de outros grupos, e ordena por data', () => {
    const a = compra(300, 3, '2026-10-05', 'g1')
    const b = compra(200, 2, '2026-10-05', 'g2')
    const avulso: Transaction = { ...a[0], id: 'x', grupoParcelas: undefined }
    const embaralhado = [a[2], b[0], avulso, a[0], b[1], a[1]]
    expect(parcelasDoGrupo(embaralhado, 'g1').map((p) => p.id)).toEqual(['g1-1', 'g1-2', 'g1-3'])
  })
})

describe('parcelasFuturas', () => {
  it('mantém só as parcelas com data estritamente maior que hoje', () => {
    const parcelas = compra(1200, 12, '2026-09-10')
    const futuras = parcelasFuturas(parcelas, '2026-11-10')
    expect(futuras.map((p) => p.data)[0]).toBe('2026-12-10')
    expect(futuras).toHaveLength(9)
    expect(parcelasFuturas(parcelas, '2026-09-10')).toHaveLength(11)
  })
})

describe('planejarEdicaoDoGrupo', () => {
  const base = { novaDescricao: 'Nike' }

  it('mesmo total, quantidade e data: só renomeia (sufixo recalculado), sem criar nem remover', () => {
    const parcelas = compra(1200, 12)
    const plano = planejarEdicaoDoGrupo({ parcelas, novoTotal: 1200, novaQuantidade: 12, novaPrimeiraData: '2026-10-05', novaDescricao: 'Tênis' })
    expect(plano.criar).toEqual([])
    expect(plano.remover).toEqual([])
    expect(plano.atualizar).toHaveLength(12)
    expect(plano.atualizar[0].patch).toEqual({ descricao: 'Tênis (1/12)' })
    expect(plano.atualizar[11].patch).toEqual({ descricao: 'Tênis (12/12)' })
  })

  it('nada mudou: plano vazio', () => {
    const plano = planejarEdicaoDoGrupo({ ...base, parcelas: compra(1200, 12), novoTotal: 1200, novaQuantidade: 12, novaPrimeiraData: '2026-10-05' })
    expect(plano).toEqual({ atualizar: [], criar: [], remover: [] })
  })

  it('novo total: 1200 → 1500 em 12x dá 125 em cada, datas intactas, soma exata', () => {
    const parcelas = compra(1200, 12)
    const plano = planejarEdicaoDoGrupo({ ...base, parcelas, novoTotal: 1500, novaQuantidade: 12, novaPrimeiraData: '2026-10-05' })
    expect(plano.atualizar).toHaveLength(12)
    expect(plano.atualizar.every((a) => a.patch.valor === 125 && !('data' in a.patch))).toBe(true)
    expect(centavos(aplicar(parcelas, plano))).toBe(150000)
  })

  it('mais parcelas: 12 → 15 atualiza as 12, cria 3 no mesmo grupo e refaz o sufixo de todas', () => {
    const parcelas = compra(1200, 12)
    const plano = planejarEdicaoDoGrupo({ ...base, parcelas, novoTotal: 1200, novaQuantidade: 15, novaPrimeiraData: '2026-10-05' })
    expect(plano.remover).toEqual([])
    expect(plano.atualizar).toHaveLength(12)
    expect(plano.criar).toHaveLength(3)
    expect(plano.criar.every((c) => c.grupoParcelas === 'g1' && c.parcelas === 15)).toBe(true)
    expect(plano.criar.map((c) => c.data)).toEqual(['2027-10-05', '2027-11-05', '2027-12-05'])
    expect(plano.criar[2].descricao).toBe('Nike (15/15)')
    expect(plano.criar[0]).toMatchObject({ tipo: 'gasto', categoria: 'Compras', pagamento: 'parcelado', origem: 'manual' })
    const final = aplicar(parcelas, plano)
    expect(final).toHaveLength(15)
    expect(final.every((p) => p.parcelas === 15)).toBe(true)
    expect(centavos(final)).toBe(120000)
  })

  it('menos parcelas: 12 → 10 atualiza as 10 primeiras e remove as 2 últimas', () => {
    const parcelas = compra(1200, 12)
    const plano = planejarEdicaoDoGrupo({ ...base, parcelas, novoTotal: 1200, novaQuantidade: 10, novaPrimeiraData: '2026-10-05' })
    expect(plano.criar).toEqual([])
    expect(plano.remover).toEqual(['g1-11', 'g1-12'])
    expect(plano.atualizar).toHaveLength(10)
    const final = aplicar(parcelas, plano)
    expect(final).toHaveLength(10)
    expect(centavos(final)).toBe(120000)
  })

  it('nova data da 1ª parcela: todas as datas são refeitas (dia 31 preservado)', () => {
    const parcelas = compra(300, 3, '2026-10-05')
    const plano = planejarEdicaoDoGrupo({ ...base, parcelas, novoTotal: 300, novaQuantidade: 3, novaPrimeiraData: '2026-01-31' })
    expect(plano.atualizar.map((a) => a.patch.data)).toEqual(['2026-01-31', '2026-02-28', '2026-03-31'])
  })

  it('mantém as datas já lançadas quando a data da 1ª parcela não muda', () => {
    const parcelas = compra(300, 3, '2026-10-05')
    parcelas[1] = { ...parcelas[1], data: '2026-11-20' } // ajuste manual de uma parcela
    const plano = planejarEdicaoDoGrupo({ ...base, parcelas, novoTotal: 600, novaQuantidade: 3, novaPrimeiraData: '2026-10-05' })
    expect(plano.atualizar.every((a) => !('data' in a.patch))).toBe(true)
  })

  it('soma exata em casos difíceis: 100 em 3x deixa o centavo na última', () => {
    const parcelas = compra(300, 3)
    const plano = planejarEdicaoDoGrupo({ ...base, parcelas, novoTotal: 100, novaQuantidade: 3, novaPrimeiraData: '2026-10-05' })
    const final = aplicar(parcelas, plano).sort((a, b) => a.data.localeCompare(b.data))
    expect(final.map((p) => p.valor)).toEqual([33.33, 33.33, 33.34])
    expect(centavos(final)).toBe(10000)
  })

  it('total que não dá 1 centavo por parcela lança RangeError (herdado do rateio)', () => {
    expect(() => planejarEdicaoDoGrupo({ ...base, parcelas: compra(300, 3), novoTotal: 0.1, novaQuantidade: 12, novaPrimeiraData: '2026-10-05' })).toThrow(RangeError)
  })

  it('parcelas de valores desiguais (editadas à mão) são sobrescritas pelo rateio novo', () => {
    const parcelas = compra(300, 3)
    parcelas[0] = { ...parcelas[0], valor: 10 }
    parcelas[1] = { ...parcelas[1], valor: 190 }
    const plano = planejarEdicaoDoGrupo({ ...base, parcelas, novoTotal: 300, novaQuantidade: 3, novaPrimeiraData: '2026-10-05' })
    const final = aplicar(parcelas, plano)
    expect(final.map((p) => p.valor)).toEqual([100, 100, 100])
  })

  it('exige um grupo de verdade: menos de 2 parcelas por compra ou grupo vazio lança RangeError', () => {
    expect(() => planejarEdicaoDoGrupo({ ...base, parcelas: compra(300, 3), novoTotal: 300, novaQuantidade: 1, novaPrimeiraData: '2026-10-05' })).toThrow(RangeError)
    expect(() => planejarEdicaoDoGrupo({ ...base, parcelas: [], novoTotal: 300, novaQuantidade: 3, novaPrimeiraData: '2026-10-05' })).toThrow(RangeError)
  })
})
