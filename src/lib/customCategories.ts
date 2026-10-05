import { ALL_CATEGORIES } from '@/lib/categories'
import type { Config } from '@/types'

export const OUTROS = 'Outros'
/** Máximo de categorias do usuário, sem contar "Outros": é o que a paleta do gráfico distingue. */
export const MAX_CATEGORIAS = 12
export const MAX_NOME = 30
export const CATEGORIAS_PADRAO: string[] = ALL_CATEGORIES.filter((c) => c !== OUTROS)

type ComCategorias = Pick<Config, 'categorias'> | null | undefined

// Sem "Outros": ele é implícito e vem sempre por último. Config antiga (sem o campo) usa o padrão.
function editaveis(config: ComCategorias): string[] {
  const lista = config?.categorias
  if (!Array.isArray(lista)) return [...CATEGORIAS_PADRAO]
  return lista.filter((c): c is string => typeof c === 'string' && c.trim() !== '' && c !== OUTROS)
}

/** Todas as categorias disponíveis, com "Outros" por último. */
export function getCategorias(config: ComCategorias): string[] {
  return [...editaveis(config), OUTROS]
}

function normalizar(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase()
}

export type MotivoNomeInvalido = 'vazio' | 'longo' | 'duplicada' | 'reservada'

export function validarNome(
  nome: string,
  existentes: string[],
): { ok: true; nome: string } | { ok: false; motivo: MotivoNomeInvalido } {
  const limpo = nome.trim()
  if (limpo === '') return { ok: false, motivo: 'vazio' }
  if (limpo.length > MAX_NOME) return { ok: false, motivo: 'longo' }
  const chave = normalizar(limpo)
  if (chave === normalizar(OUTROS)) return { ok: false, motivo: 'reservada' }
  if (existentes.some((e) => normalizar(e) === chave)) return { ok: false, motivo: 'duplicada' }
  return { ok: true, nome: limpo }
}

function exigirEditavel(lista: string[], nome: string) {
  if (nome === OUTROS) throw new Error('"Outros" não pode ser alterada')
  if (!lista.includes(nome)) throw new Error(`Categoria inexistente: ${nome}`)
}

/** Renomeia mantendo a posição; o limite da categoria acompanha o nome novo. */
export function renomear(config: Config, de: string, para: string): Config {
  const lista = editaveis(config)
  exigirEditavel(lista, de)
  const limites = { ...config.limitesPorCategoria }
  if (de in limites) {
    limites[para] = limites[de]
    delete limites[de]
  }
  return { ...config, categorias: lista.map((c) => (c === de ? para : c)), limitesPorCategoria: limites }
}

/** Tira a categoria da lista e descarta o limite dela. Reatribuir os lançamentos é papel de quem chama. */
export function remover(config: Config, nome: string): Config {
  const lista = editaveis(config)
  exigirEditavel(lista, nome)
  const limites = { ...config.limitesPorCategoria }
  delete limites[nome]
  return { ...config, categorias: lista.filter((c) => c !== nome), limitesPorCategoria: limites }
}
