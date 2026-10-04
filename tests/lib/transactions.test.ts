import { describe, it, expect } from 'vitest'
import { sortByDateDesc } from '@/lib/transactions'
import type { Transaction } from '@/types'

const tx = (id: string, data: string): Transaction => ({
  id, data, tipo: 'gasto', descricao: id, valor: 1, categoria: 'Outros',
  pagamento: 'pix', origem: 'manual', createdAt: '2026-01-01T00:00:00Z',
})

describe('sortByDateDesc', () => {
  it('lista vazia devolve lista vazia', () => {
    expect(sortByDateDesc([])).toEqual([])
  })

  it('uma transação devolve a mesma', () => {
    expect(sortByDateDesc([tx('a', '2026-09-01')]).map((t) => t.id)).toEqual(['a'])
  })

  it('ordena da data mais recente para a mais antiga', () => {
    const out = sortByDateDesc([tx('a', '2026-08-20'), tx('b', '2026-09-30'), tx('c', '2026-09-01')])
    expect(out.map((t) => t.id)).toEqual(['b', 'c', 'a'])
  })

  it('datas iguais mantêm a ordem original (mais recente inserida primeiro)', () => {
    const out = sortByDateDesc([tx('novo', '2026-09-01'), tx('velho', '2026-09-01'), tx('outro', '2026-09-02')])
    expect(out.map((t) => t.id)).toEqual(['outro', 'novo', 'velho'])
  })

  it('não muta a lista de entrada', () => {
    const entrada = [tx('a', '2026-08-20'), tx('b', '2026-09-30')]
    sortByDateDesc(entrada)
    expect(entrada.map((t) => t.id)).toEqual(['a', 'b'])
  })
})
