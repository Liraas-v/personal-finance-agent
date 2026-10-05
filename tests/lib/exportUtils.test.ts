import { describe, it, expect, vi, afterEach } from 'vitest'
import { exportCSV } from '@/lib/exportUtils'
import type { Transaction } from '@/types'

const base: Transaction = {
  id: '1', tipo: 'gasto', descricao: 'Nike (1/2)', valor: 50, categoria: 'Compras', pagamento: 'parcelado',
  parcelas: 2, data: '2026-10-05', origem: 'manual', createdAt: '2026-10-05T00:00:00Z',
}

async function gerarCSV(transactions: Transaction[]): Promise<string[]> {
  let capturado: Blob | undefined
  vi.stubGlobal('URL', {
    createObjectURL: (b: Blob) => {
      capturado = b
      return 'blob:teste'
    },
    revokeObjectURL: vi.fn(),
  })
  exportCSV(transactions, 'x.csv')
  const texto = await capturado!.text()
  return texto.replace(/^﻿/, '').split('\n')
}

afterEach(() => vi.unstubAllGlobals())

describe('exportCSV', () => {
  it('o cabeçalho termina com a coluna grupo_parcelas', async () => {
    const [header] = await gerarCSV([base])
    expect(header).toBe('id,data,descricao,categoria,valor,tipo,pagamento,parcelas,origem,grupo_parcelas')
  })

  it('parcela com grupo exporta o id do grupo; sem grupo, a coluna fica vazia', async () => {
    const [, comGrupo, semGrupo] = await gerarCSV([
      { ...base, grupoParcelas: 'g-abc' },
      { ...base, id: '2', descricao: 'Padaria', parcelas: undefined, pagamento: 'pix' },
    ])
    expect(comGrupo.endsWith(',manual,g-abc')).toBe(true)
    expect(semGrupo.endsWith(',manual,')).toBe(true)
  })
})
