import { describe, it, expect, beforeEach } from 'vitest'
import { LocalTransactionRepository } from '@/lib/repositories/localTransactionRepository'

describe('LocalTransactionRepository', () => {
  const repo = new LocalTransactionRepository()

  beforeEach(() => {
    window.localStorage.clear()
  })

  it('list() semeia os dados de exemplo na primeira leitura', async () => {
    const transactions = await repo.list()
    expect(transactions.length).toBeGreaterThan(20)
    expect(window.localStorage.getItem('finance-agent:demo:transactions')).not.toBeNull()
  })

  it('list() não repõe o seed depois que os dados já existem', async () => {
    const original = await repo.list()
    await repo.remove(original[0].id)

    const afterRemove = await repo.list()
    expect(afterRemove.length).toBe(original.length - 1)

    const secondRead = await repo.list()
    expect(secondRead.length).toBe(original.length - 1)
  })

  it('create() adiciona uma transação no início da lista e persiste', async () => {
    const before = await repo.list()
    const created = await repo.create({
      tipo: 'gasto', descricao: 'Teste', valor: 10, categoria: 'Outros',
      pagamento: 'pix', data: '2026-08-18', origem: 'manual',
    })

    expect(created.id).toBeTruthy()
    const after = await repo.list()
    expect(after.length).toBe(before.length + 1)
    expect(after[0].id).toBe(created.id)
  })

  it('update() atualiza os campos informados mantendo o id', async () => {
    const [first] = await repo.list()
    const updated = await repo.update(first.id, { descricao: 'Editado' })

    expect(updated.id).toBe(first.id)
    expect(updated.descricao).toBe('Editado')
  })

  it('update() lança erro quando o id não existe', async () => {
    await repo.list()
    await expect(repo.update('id-inexistente', { descricao: 'x' })).rejects.toThrow('Transaction not found')
  })

  it('remove() tira a transação da lista persistida', async () => {
    const [first] = await repo.list()
    await repo.remove(first.id)
    const after = await repo.list()
    expect(after.find((t) => t.id === first.id)).toBeUndefined()
  })

  it('clear() zera a lista persistida', async () => {
    await repo.list()
    await repo.clear()
    expect(await repo.list()).toEqual([])
  })
})
