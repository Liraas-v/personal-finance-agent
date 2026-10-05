import { describe, it, expect } from 'vitest'
import {
  CATEGORIAS_PADRAO,
  MAX_CATEGORIAS,
  OUTROS,
  getCategorias,
  remover,
  renomear,
  validarNome,
} from '@/lib/customCategories'
import { ALL_CATEGORIES } from '@/lib/categories'
import type { Config } from '@/types'

const config = (extra: Partial<Config> = {}): Config => ({
  metaEconomia: 0,
  limitesPorCategoria: {},
  ollama: { model: 'm', url: 'u' },
  moeda: 'BRL',
  ...extra,
})

describe('CATEGORIAS_PADRAO', () => {
  it('são as 8 atuais, na ordem de ALL_CATEGORIES sem "Outros"', () => {
    expect(CATEGORIAS_PADRAO).toEqual(ALL_CATEGORIES.filter((c) => c !== OUTROS))
    expect(CATEGORIAS_PADRAO).toHaveLength(8)
  })
})

describe('getCategorias', () => {
  it('configuração antiga, sem "categorias", devolve as 8 padrão + "Outros"', () => {
    expect(getCategorias(config())).toEqual(ALL_CATEGORIES)
    expect(getCategorias(null)).toEqual(ALL_CATEGORIES)
    expect(getCategorias(undefined)).toEqual(ALL_CATEGORIES)
  })

  it('usa a lista da configuração e põe "Outros" sempre por último', () => {
    expect(getCategorias(config({ categorias: ['Pets', 'Casa'] }))).toEqual(['Pets', 'Casa', 'Outros'])
  })

  it('"Outros" não duplica nem sobe de posição, mesmo se vier gravado na lista', () => {
    expect(getCategorias(config({ categorias: ['Outros', 'Pets'] }))).toEqual(['Pets', 'Outros'])
  })

  it('lista vazia na configuração vale: só "Outros"', () => {
    expect(getCategorias(config({ categorias: [] }))).toEqual(['Outros'])
  })

  it('ignora entradas que não são texto (arquivo editado à mão)', () => {
    expect(getCategorias(config({ categorias: ['Pets', 5, null, ''] as never }))).toEqual(['Pets', 'Outros'])
  })
})

describe('validarNome', () => {
  const existentes = ['Alimentação', 'Saúde', 'Outros']

  it('aceita e devolve o nome sem espaços nas pontas', () => {
    expect(validarNome('  Pets  ', existentes)).toEqual({ ok: true, nome: 'Pets' })
  })

  it('vazio ou só espaços', () => {
    expect(validarNome('', existentes)).toEqual({ ok: false, motivo: 'vazio' })
    expect(validarNome('   ', existentes)).toEqual({ ok: false, motivo: 'vazio' })
  })

  it('mais de 30 caracteres é longo; exatamente 30 passa', () => {
    expect(validarNome('a'.repeat(31), existentes)).toEqual({ ok: false, motivo: 'longo' })
    expect(validarNome('a'.repeat(30), existentes).ok).toBe(true)
  })

  it('duplicada ignora caixa e acentos ("saude" × "Saúde")', () => {
    expect(validarNome('saude', existentes)).toEqual({ ok: false, motivo: 'duplicada' })
    expect(validarNome('ALIMENTACAO', existentes)).toEqual({ ok: false, motivo: 'duplicada' })
  })

  it('"Outros" é reservada em qualquer grafia', () => {
    expect(validarNome('outros', [])).toEqual({ ok: false, motivo: 'reservada' })
    expect(validarNome('  OUTROS ', [])).toEqual({ ok: false, motivo: 'reservada' })
  })
})

describe('renomear', () => {
  it('troca o nome mantendo a posição e move o limite junto', () => {
    const c = config({ categorias: ['Pets', 'Casa'], limitesPorCategoria: { Pets: 300, Casa: 100 } })
    const r = renomear(c, 'Pets', 'Animais')
    expect(r.categorias).toEqual(['Animais', 'Casa'])
    expect(r.limitesPorCategoria).toEqual({ Animais: 300, Casa: 100 })
  })

  it('em configuração antiga parte das categorias padrão', () => {
    const r = renomear(config({ limitesPorCategoria: { Lazer: 200 } }), 'Lazer', 'Diversão')
    expect(r.categorias).toEqual(['Alimentação', 'Transporte', 'Saúde', 'Assinaturas', 'Compras', 'Moradia', 'Educação', 'Diversão'])
    expect(r.limitesPorCategoria).toEqual({ Diversão: 200 })
  })

  it('sem limite definido, não cria limite', () => {
    const r = renomear(config({ categorias: ['Pets'] }), 'Pets', 'Animais')
    expect(r.limitesPorCategoria).toEqual({})
  })

  it('não altera a configuração original', () => {
    const c = config({ categorias: ['Pets'], limitesPorCategoria: { Pets: 1 } })
    renomear(c, 'Pets', 'Animais')
    expect(c.categorias).toEqual(['Pets'])
    expect(c.limitesPorCategoria).toEqual({ Pets: 1 })
  })

  it('"Outros" não pode ser renomeada', () => {
    expect(() => renomear(config(), 'Outros', 'Resto')).toThrow()
  })

  it('categoria inexistente lança', () => {
    expect(() => renomear(config({ categorias: ['Pets'] }), 'Nada', 'X')).toThrow()
  })
})

describe('remover', () => {
  it('tira da lista e descarta o limite', () => {
    const c = config({ categorias: ['Pets', 'Casa'], limitesPorCategoria: { Pets: 300, Casa: 100 } })
    const r = remover(c, 'Pets')
    expect(r.categorias).toEqual(['Casa'])
    expect(r.limitesPorCategoria).toEqual({ Casa: 100 })
  })

  it('categoria padrão pode ser removida (parte da lista padrão)', () => {
    const r = remover(config(), 'Lazer')
    expect(r.categorias).not.toContain('Lazer')
    expect(r.categorias).toHaveLength(7)
  })

  it('"Outros" não pode ser removida', () => {
    expect(() => remover(config(), 'Outros')).toThrow()
  })

  it('categoria inexistente lança', () => {
    expect(() => remover(config({ categorias: ['Pets'] }), 'Nada')).toThrow()
  })
})

describe('MAX_CATEGORIAS', () => {
  it('são 12 sem contar "Outros"', () => {
    expect(MAX_CATEGORIAS).toBe(12)
  })
})
