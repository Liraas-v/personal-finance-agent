import { splitInstallments } from '@/lib/installments'
import type { CreateTransactionInput } from '@/lib/repositories/types'
import type { Transaction } from '@/types'

export interface PlanoDeGrupo {
  atualizar: { id: string; patch: Partial<CreateTransactionInput> }[]
  criar: CreateTransactionInput[]
  remover: string[]
}

const SUFIXO_PARCELA = /\s*\(\d+\/\d+\)$/

/** "Nike (3/12)" → "Nike". */
export function descricaoBase(descricao: string): string {
  return descricao.replace(SUFIXO_PARCELA, '')
}

/** Parcelas de um grupo, da mais antiga para a mais nova. Lançamentos sem grupo nunca entram. */
export function parcelasDoGrupo(todas: Transaction[], grupo: string): Transaction[] {
  return todas.filter((t) => t.grupoParcelas === grupo).sort((a, b) => a.data.localeCompare(b.data))
}

/** Parcelas com data estritamente posterior a `hoje` (aaaa-mm-dd). */
export function parcelasFuturas(parcelas: Transaction[], hoje: string): Transaction[] {
  return parcelas.filter((p) => p.data > hoje)
}

/**
 * Calcula o que muda no armazenamento para o grupo passar a ter o novo total, quantidade, 1ª data e
 * descrição. O rateio é refeito do zero (reusa `splitInstallments`, então a soma é sempre exata):
 * parcelas de valores desiguais, ajustadas à mão, são sobrescritas. As datas já lançadas só mudam
 * se a data da 1ª parcela mudar. Parcelas existentes são casadas por posição: as que sobram saem
 * (as últimas) e as que faltam são criadas.
 */
export function planejarEdicaoDoGrupo(args: {
  parcelas: Transaction[]
  novoTotal: number
  novaQuantidade: number
  novaPrimeiraData: string
  novaDescricao: string
}): PlanoDeGrupo {
  const { novoTotal, novaQuantidade, novaPrimeiraData, novaDescricao } = args
  const parcelas = [...args.parcelas].sort((a, b) => a.data.localeCompare(b.data))

  const grupo = parcelas[0]?.grupoParcelas
  if (parcelas.length === 0 || !grupo) throw new RangeError('Grupo de parcelas vazio')
  if (novaQuantidade < 2) throw new RangeError('Uma compra parcelada precisa de ao menos 2 parcelas')

  const desejadas = splitInstallments({
    total: novoTotal,
    parcelas: novaQuantidade,
    primeiraData: novaPrimeiraData,
    descricao: novaDescricao,
    grupoParcelas: grupo,
  })
  const refazDatas = novaPrimeiraData !== parcelas[0].data
  const modelo = parcelas[parcelas.length - 1]
  const plano: PlanoDeGrupo = { atualizar: [], criar: [], remover: [] }

  desejadas.forEach((d, i) => {
    const existente = parcelas[i]
    if (!existente) {
      plano.criar.push({
        tipo: modelo.tipo,
        descricao: d.descricao,
        valor: d.valor,
        categoria: modelo.categoria,
        pagamento: modelo.pagamento,
        parcelas: d.parcelas,
        grupoParcelas: grupo,
        data: d.data,
        origem: modelo.origem,
      })
      return
    }
    const patch: Partial<CreateTransactionInput> = {}
    if (existente.descricao !== d.descricao) patch.descricao = d.descricao
    if (existente.valor !== d.valor) patch.valor = d.valor
    if (existente.parcelas !== d.parcelas) patch.parcelas = d.parcelas
    if (refazDatas && existente.data !== d.data) patch.data = d.data
    if (Object.keys(patch).length > 0) plano.atualizar.push({ id: existente.id, patch })
  })

  plano.remover = parcelas.slice(desejadas.length).map((p) => p.id)
  return plano
}
