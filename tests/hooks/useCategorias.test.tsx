import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'

const mocks = vi.hoisted(() => ({
  txUpdate: vi.fn(),
  cfgUpdate: vi.fn(),
  toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}))

vi.mock('sonner', () => ({ toast: mocks.toast }))
vi.mock('@/lib/repositories', () => ({
  getTransactionRepository: () => ({ update: mocks.txUpdate, create: vi.fn(), remove: vi.fn(), list: vi.fn() }),
  getConfigRepository: () => ({ read: vi.fn(), update: mocks.cfgUpdate }),
}))

import { useFinanceStore } from '@/lib/store'
import { useCategorias } from '@/hooks/useCategorias'
import type { Config, Transaction } from '@/types'

const tx = (id: string, categoria: string): Transaction => ({
  id, categoria, tipo: 'gasto', descricao: id, valor: 10, pagamento: 'pix', data: '2026-10-01',
  origem: 'manual', createdAt: '2026-10-01T00:00:00Z',
})

const configBase: Config = {
  metaEconomia: 0,
  limitesPorCategoria: { Pets: 300, Lazer: 100 },
  categorias: ['Lazer', 'Pets'],
  ollama: { model: 'm', url: 'u' },
  moeda: 'BRL',
}

const idsPorCategoria = (cat: string) =>
  useFinanceStore.getState().transactions.filter((t) => t.categoria === cat).map((t) => t.id)

beforeEach(() => {
  mocks.txUpdate.mockReset().mockImplementation(async (id: string, patch: object) => ({
    ...useFinanceStore.getState().transactions.find((t) => t.id === id)!, ...patch,
  }))
  mocks.cfgUpdate.mockReset().mockImplementation(async (patch: Partial<Config>) => ({ ...useFinanceStore.getState().config!, ...patch }))
  Object.values(mocks.toast).forEach((f) => f.mockClear())
  useFinanceStore.setState({
    config: configBase,
    transactions: [tx('a', 'Pets'), tx('b', 'Pets'), tx('c', 'Lazer'), tx('d', 'Outros')],
  })
})

describe('useCategorias — listagem', () => {
  it('devolve as categorias da configuração com "Outros" por último', () => {
    const { result } = renderHook(() => useCategorias())
    expect(result.current.categorias).toEqual(['Lazer', 'Pets', 'Outros'])
  })

  it('config antiga, sem "categorias", devolve as padrão', () => {
    useFinanceStore.setState({ config: { ...configBase, categorias: undefined } })
    const { result } = renderHook(() => useCategorias())
    expect(result.current.categorias).toHaveLength(9)
  })

  it('contarLancamentos conta as transações de uma categoria', () => {
    const { result } = renderHook(() => useCategorias())
    expect(result.current.contarLancamentos('Pets')).toBe(2)
    expect(result.current.contarLancamentos('Nada')).toBe(0)
  })
})

describe('useCategorias.adicionar', () => {
  it('valida, persiste via repositório e atualiza o store', async () => {
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.adicionar('  Viagens ') })
    expect(r).toEqual({ ok: true })
    expect(mocks.cfgUpdate).toHaveBeenCalledWith({ categorias: ['Lazer', 'Pets', 'Viagens'] })
    expect(useFinanceStore.getState().config?.categorias).toEqual(['Lazer', 'Pets', 'Viagens'])
    expect(mocks.toast.success).toHaveBeenCalledTimes(1)
  })

  it('recusa nome duplicado (sem acento/caixa), vazio e reservado, sem persistir', async () => {
    const { result } = renderHook(() => useCategorias())
    const casos: [string, string][] = [['pets', 'duplicada'], ['  ', 'vazio'], ['outros', 'reservada']]
    for (const [nome, motivo] of casos) {
      let r: unknown
      await act(async () => { r = await result.current.adicionar(nome) })
      expect(r).toEqual({ ok: false, motivo })
    }
    expect(mocks.cfgUpdate).not.toHaveBeenCalled()
  })

  it('recusa ao atingir o limite de 12 categorias', async () => {
    useFinanceStore.setState({ config: { ...configBase, categorias: Array.from({ length: 12 }, (_, i) => `C${i}`) } })
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.adicionar('Nova') })
    expect(r).toEqual({ ok: false, motivo: 'limite' })
    expect(mocks.cfgUpdate).not.toHaveBeenCalled()
  })

  it('falha ao gravar a configuração: avisa e não muda o store', async () => {
    mocks.cfgUpdate.mockRejectedValue(new Error('falhou'))
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.adicionar('Viagens') })
    expect(r).toEqual({ ok: false, motivo: 'falha' })
    expect(useFinanceStore.getState().config?.categorias).toEqual(['Lazer', 'Pets'])
    expect(mocks.toast.error).toHaveBeenCalled()
  })
})

describe('useCategorias.renomear', () => {
  it('propaga para CADA lançamento da categoria e move o limite', async () => {
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.renomear('Pets', 'Animais') })

    expect(r).toEqual({ ok: true })
    expect(mocks.txUpdate.mock.calls.map((c) => c[0])).toEqual(['a', 'b'])
    expect(mocks.txUpdate).toHaveBeenCalledWith('a', { categoria: 'Animais' })
    expect(idsPorCategoria('Animais')).toEqual(['a', 'b'])
    expect(mocks.cfgUpdate).toHaveBeenCalledTimes(1)
    const patch = mocks.cfgUpdate.mock.calls[0][0]
    expect(patch.categorias).toEqual(['Lazer', 'Animais'])
    expect(patch.limitesPorCategoria).toEqual({ Animais: 300, Lazer: 100 })
  })

  it('permite só mudar a caixa ("Pets" → "PETS")', async () => {
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.renomear('Pets', 'PETS') })
    expect(r).toEqual({ ok: true })
  })

  it('recusa renomear para um nome que já existe, sem tocar em nada', async () => {
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.renomear('Pets', 'lazer') })
    expect(r).toEqual({ ok: false, motivo: 'duplicada' })
    expect(mocks.txUpdate).not.toHaveBeenCalled()
    expect(mocks.cfgUpdate).not.toHaveBeenCalled()
  })

  it('"Outros" não pode ser renomeada e categoria inexistente é recusada', async () => {
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.renomear('Outros', 'Resto') })
    expect(r).toEqual({ ok: false, motivo: 'reservada' })
    await act(async () => { r = await result.current.renomear('Nada', 'X') })
    expect(r).toEqual({ ok: false, motivo: 'inexistente' })
    expect(mocks.cfgUpdate).not.toHaveBeenCalled()
  })

  it('categoria sem lançamentos renomeia sem tocar em transações', async () => {
    useFinanceStore.setState({ transactions: [tx('c', 'Lazer')] })
    const { result } = renderHook(() => useCategorias())
    await act(async () => { await result.current.renomear('Pets', 'Animais') })
    expect(mocks.txUpdate).not.toHaveBeenCalled()
    expect(mocks.cfgUpdate).toHaveBeenCalledTimes(1)
  })

  it('falha no meio: a configuração NÃO é alterada, o aviso conta os não atualizados e o que já mudou é desfeito', async () => {
    mocks.txUpdate.mockImplementation(async (id: string, patch: { categoria: string }) => {
      if (id === 'b' && patch.categoria === 'Animais') throw new Error('falhou')
      return { ...useFinanceStore.getState().transactions.find((t) => t.id === id)!, ...patch }
    })
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.renomear('Pets', 'Animais') })

    expect(r).toEqual({ ok: false, motivo: 'falha' })
    expect(mocks.cfgUpdate).not.toHaveBeenCalled()
    expect(useFinanceStore.getState().config?.categorias).toEqual(['Lazer', 'Pets'])
    expect(String(mocks.toast.error.mock.calls[0][0])).toContain('1 de 2 lançamentos não foram atualizados')
    // a primeira já tinha sido migrada e foi devolvida à categoria antiga
    expect(idsPorCategoria('Pets')).toEqual(['a', 'b'])
    expect(idsPorCategoria('Animais')).toEqual([])
  })

  it('se até o desfazer falhar, o aviso diz quantos ficaram na categoria nova', async () => {
    mocks.txUpdate.mockImplementation(async (id: string, patch: { categoria: string }) => {
      if (id === 'b' && patch.categoria === 'Animais') throw new Error('falhou')
      if (id === 'a' && patch.categoria === 'Pets') throw new Error('desfazer falhou')
      return { ...useFinanceStore.getState().transactions.find((t) => t.id === id)!, ...patch }
    })
    const { result } = renderHook(() => useCategorias())
    await act(async () => { await result.current.renomear('Pets', 'Animais') })
    expect(String(mocks.toast.error.mock.calls[0][0])).toMatch(/1 lançamento.*"Animais"/)
    expect(mocks.cfgUpdate).not.toHaveBeenCalled()
  })

  it('falha ao gravar a configuração depois de migrar: devolve os lançamentos e avisa', async () => {
    mocks.cfgUpdate.mockRejectedValue(new Error('falhou'))
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.renomear('Pets', 'Animais') })
    expect(r).toEqual({ ok: false, motivo: 'falha' })
    expect(idsPorCategoria('Pets')).toEqual(['a', 'b'])
    expect(mocks.toast.error).toHaveBeenCalled()
  })
})

describe('useCategorias.remover', () => {
  it('reatribui os lançamentos ao destino e descarta o limite', async () => {
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.remover('Pets', 'Outros') })

    expect(r).toEqual({ ok: true })
    expect(mocks.txUpdate).toHaveBeenCalledTimes(2)
    expect(mocks.txUpdate).toHaveBeenCalledWith('a', { categoria: 'Outros' })
    expect(idsPorCategoria('Outros').sort()).toEqual(['a', 'b', 'd'])
    const patch = mocks.cfgUpdate.mock.calls[0][0]
    expect(patch.categorias).toEqual(['Lazer'])
    expect(patch.limitesPorCategoria).toEqual({ Lazer: 100 })
  })

  it('aceita outra categoria como destino', async () => {
    const { result } = renderHook(() => useCategorias())
    await act(async () => { await result.current.remover('Pets', 'Lazer') })
    expect(idsPorCategoria('Lazer').sort()).toEqual(['a', 'b', 'c'])
  })

  it('recusa destino inexistente ou igual à categoria removida, sem tocar em nada', async () => {
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.remover('Pets', 'Fantasma') })
    expect(r).toEqual({ ok: false, motivo: 'destino' })
    await act(async () => { r = await result.current.remover('Pets', 'Pets') })
    expect(r).toEqual({ ok: false, motivo: 'destino' })
    expect(mocks.txUpdate).not.toHaveBeenCalled()
    expect(mocks.cfgUpdate).not.toHaveBeenCalled()
  })

  it('"Outros" não pode ser removida', async () => {
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.remover('Outros', 'Lazer') })
    expect(r).toEqual({ ok: false, motivo: 'reservada' })
  })

  it('categoria sem lançamentos remove sem tocar em transações', async () => {
    useFinanceStore.setState({ transactions: [tx('c', 'Lazer')] })
    const { result } = renderHook(() => useCategorias())
    await act(async () => { await result.current.remover('Pets', 'Outros') })
    expect(mocks.txUpdate).not.toHaveBeenCalled()
    expect(mocks.cfgUpdate).toHaveBeenCalledTimes(1)
  })

  it('falha no meio: configuração intacta e aviso com a contagem', async () => {
    mocks.txUpdate.mockImplementation(async (id: string, patch: { categoria: string }) => {
      if (id === 'a' && patch.categoria === 'Outros') throw new Error('falhou')
      return { ...useFinanceStore.getState().transactions.find((t) => t.id === id)!, ...patch }
    })
    const { result } = renderHook(() => useCategorias())
    let r: unknown
    await act(async () => { r = await result.current.remover('Pets', 'Outros') })
    expect(r).toEqual({ ok: false, motivo: 'falha' })
    expect(mocks.cfgUpdate).not.toHaveBeenCalled()
    expect(String(mocks.toast.error.mock.calls[0][0])).toContain('1 de 2 lançamentos não foram atualizados')
    expect(idsPorCategoria('Pets').sort()).toEqual(['a', 'b'])
  })
})
