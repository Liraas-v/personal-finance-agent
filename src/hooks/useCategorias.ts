// hooks/useCategorias.ts
import { useCallback } from 'react'
import { toast } from 'sonner'
import { useFinanceStore } from '@/lib/store'
import { getConfigRepository, getTransactionRepository } from '@/lib/repositories'
import {
  MAX_CATEGORIAS,
  OUTROS,
  getCategorias,
  remover as removerDaConfig,
  renomear as renomearNaConfig,
  validarNome,
} from '@/lib/customCategories'
import type { Config } from '@/types'

const transactionRepository = getTransactionRepository()
const configRepository = getConfigRepository()

export type Resultado = { ok: true } | { ok: false; motivo: string }

const editaveis = (config: Config | null) => getCategorias(config).filter((c) => c !== OUTROS)

export function useCategorias() {
  const config = useFinanceStore((s) => s.config)
  const categorias = getCategorias(config)

  const transactions = useFinanceStore((s) => s.transactions)
  const contarLancamentos = useCallback(
    (nome: string) => transactions.filter((t) => t.categoria === nome).length,
    [transactions]
  )

  // Grava só `categorias` e `limitesPorCategoria` da configuração nova (as demais chaves não mudam).
  const gravarConfig = useCallback(async (nova: Config): Promise<boolean> => {
    try {
      const salva = await configRepository.update({
        categorias: nova.categorias,
        limitesPorCategoria: nova.limitesPorCategoria,
      })
      useFinanceStore.getState().setConfig(salva)
      return true
    } catch {
      return false
    }
  }, [])

  // Move lançamentos de uma categoria para outra, um a um, e só reflete no store o que foi persistido.
  // Tenta todos; devolve os ids que mudaram e quantos falharam.
  const migrar = useCallback(async (ids: string[], para: string) => {
    const migrados: string[] = []
    let falhas = 0
    for (const id of ids) {
      try {
        const salva = await transactionRepository.update(id, { categoria: para })
        useFinanceStore.getState().updateTransaction(salva)
        migrados.push(id)
      } catch {
        falhas++
      }
    }
    return { migrados, falhas }
  }, [])

  // Desfaz uma migração parcial (melhor esforço). Devolve quantos lançamentos NÃO voltaram.
  const desfazer = useCallback(async (ids: string[], para: string): Promise<number> => {
    const { falhas } = await migrar(ids, para)
    return falhas
  }, [migrar])

  const avisarFalha = (acao: string, falhas: number, total: number, ficaram: number, nova: string) => {
    let msg = `Não foi possível ${acao}: ${falhas} de ${total} lançamentos não foram atualizados. A lista de categorias não foi alterada.`
    if (ficaram > 0) {
      msg += ` ${ficaram} ${ficaram === 1 ? 'lançamento ficou' : 'lançamentos ficaram'} em "${nova}"; tente de novo para concluir.`
    }
    toast.error(msg)
  }

  const adicionar = useCallback(async (nome: string): Promise<Resultado> => {
    const atuais = useFinanceStore.getState().config
    const lista = getCategorias(atuais)
    const v = validarNome(nome, lista)
    if (!v.ok) return { ok: false, motivo: v.motivo }
    if (editaveis(atuais).length >= MAX_CATEGORIAS) return { ok: false, motivo: 'limite' }
    try {
      const salva = await configRepository.update({ categorias: [...editaveis(atuais), v.nome] })
      useFinanceStore.getState().setConfig(salva)
      toast.success(`Categoria "${v.nome}" criada`)
      return { ok: true }
    } catch {
      toast.error('Erro ao salvar a categoria')
      return { ok: false, motivo: 'falha' }
    }
  }, [])

  const renomear = useCallback(
    async (de: string, para: string): Promise<Resultado> => {
      const atuais = useFinanceStore.getState().config
      if (!atuais) return { ok: false, motivo: 'falha' }
      if (de === OUTROS) return { ok: false, motivo: 'reservada' }
      if (!editaveis(atuais).includes(de)) return { ok: false, motivo: 'inexistente' }
      const v = validarNome(para, getCategorias(atuais).filter((c) => c !== de))
      if (!v.ok) return { ok: false, motivo: v.motivo }

      const ids = useFinanceStore.getState().transactions.filter((t) => t.categoria === de).map((t) => t.id)
      // Ordem segura: 1) lançamentos; 2) só se TODOS passaram, a configuração. Se algo falhar, os já
      // migrados voltam à categoria antiga (melhor esforço) e a configuração nunca é gravada pela metade.
      const { migrados, falhas } = await migrar(ids, v.nome)
      if (falhas > 0) {
        const ficaram = await desfazer(migrados, de)
        avisarFalha(`renomear "${de}"`, falhas, ids.length, ficaram, v.nome)
        return { ok: false, motivo: 'falha' }
      }
      if (!(await gravarConfig(renomearNaConfig(atuais, de, v.nome)))) {
        const ficaram = await desfazer(migrados, de)
        toast.error(
          ficaram > 0
            ? `Erro ao salvar a configuração; ${ficaram} lançamentos ficaram em "${v.nome}". Tente de novo.`
            : 'Erro ao salvar a configuração; nada foi alterado.'
        )
        return { ok: false, motivo: 'falha' }
      }
      toast.success(`"${de}" agora é "${v.nome}"`)
      return { ok: true }
    },
    [migrar, desfazer, gravarConfig]
  )

  const remover = useCallback(
    async (nome: string, reatribuirPara: string): Promise<Resultado> => {
      const atuais = useFinanceStore.getState().config
      if (!atuais) return { ok: false, motivo: 'falha' }
      if (nome === OUTROS) return { ok: false, motivo: 'reservada' }
      if (!editaveis(atuais).includes(nome)) return { ok: false, motivo: 'inexistente' }
      if (reatribuirPara === nome || !getCategorias(atuais).includes(reatribuirPara)) {
        return { ok: false, motivo: 'destino' }
      }

      const ids = useFinanceStore.getState().transactions.filter((t) => t.categoria === nome).map((t) => t.id)
      const { migrados, falhas } = await migrar(ids, reatribuirPara)
      if (falhas > 0) {
        const ficaram = await desfazer(migrados, nome)
        avisarFalha(`remover "${nome}"`, falhas, ids.length, ficaram, reatribuirPara)
        return { ok: false, motivo: 'falha' }
      }
      if (!(await gravarConfig(removerDaConfig(atuais, nome)))) {
        const ficaram = await desfazer(migrados, nome)
        toast.error(
          ficaram > 0
            ? `Erro ao salvar a configuração; ${ficaram} lançamentos ficaram em "${reatribuirPara}". Tente de novo.`
            : 'Erro ao salvar a configuração; nada foi alterado.'
        )
        return { ok: false, motivo: 'falha' }
      }
      toast.success(`Categoria "${nome}" removida`)
      return { ok: true }
    },
    [migrar, desfazer, gravarConfig]
  )

  return { categorias, contarLancamentos, adicionar, renomear, remover }
}
