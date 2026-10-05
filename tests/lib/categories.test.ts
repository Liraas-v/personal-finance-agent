import { describe, it, expect } from 'vitest'
import { categorizeByKeyword, ALL_CATEGORIES } from '@/lib/categories'

describe('categorizeByKeyword', () => {
  it('categorizes "iFood" as Alimentação', () => {
    expect(categorizeByKeyword('iFood')).toBe('Alimentação')
  })

  it('categorizes "Uber" as Transporte', () => {
    expect(categorizeByKeyword('Uber')).toBe('Transporte')
  })

  it('categorizes "Spotify" as Assinaturas', () => {
    expect(categorizeByKeyword('Spotify')).toBe('Assinaturas')
  })

  it('categorizes "amazon prime" as Assinaturas (more specific than amazon)', () => {
    expect(categorizeByKeyword('amazon prime')).toBe('Assinaturas')
  })

  it('categorizes "amazon" as Compras', () => {
    expect(categorizeByKeyword('amazon')).toBe('Compras')
  })

  it('returns Outros for unknown text', () => {
    expect(categorizeByKeyword('xyzabc')).toBe('Outros')
  })

  it('ALL_CATEGORIES contains 9 items', () => {
    expect(ALL_CATEGORIES).toHaveLength(9)
  })
})

describe('categorizeByKeyword — categorias válidas do usuário', () => {
  const validas = ['Alimentação', 'Transporte', 'Pets', 'Outros']

  it('sem a lista, o comportamento é o de sempre', () => {
    expect(categorizeByKeyword('cinema')).toBe('Lazer')
    expect(categorizeByKeyword('Uber')).toBe('Transporte')
  })

  it('categoria encontrada que não existe mais cai em "Outros"', () => {
    expect(categorizeByKeyword('cinema', validas)).toBe('Outros')
  })

  it('categoria encontrada que existe é mantida', () => {
    expect(categorizeByKeyword('Uber', validas)).toBe('Transporte')
    expect(categorizeByKeyword('ifood', validas)).toBe('Alimentação')
  })

  it('texto desconhecido continua "Outros"', () => {
    expect(categorizeByKeyword('xyzabc', validas)).toBe('Outros')
  })
})

