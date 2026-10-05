'use client'
import { useId, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTransactions } from '@/hooks/useTransactions'
import { useFinanceStore } from '@/lib/store'
import { formatCurrency } from '@/lib/currency'
import { formatDateBR } from '@/lib/dates'
import { MAX_PARCELAS } from '@/lib/installments'
import { descricaoBase, parcelasDoGrupo, parcelasFuturas, planejarEdicaoDoGrupo } from '@/lib/installmentGroups'
import type { Transaction } from '@/types'

interface Props {
  /** Uma parcela do grupo; `null` mantém o diálogo fechado. */
  transaction: Transaction | null
  onClose: () => void
}

type Modo = 'resumo' | 'editar' | 'excluir-todas' | 'excluir-futuras'

export function InstallmentGroupDialog({ transaction, onClose }: Props) {
  return (
    <Dialog open={transaction !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-card">
        {transaction && <Conteudo transaction={transaction} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function Conteudo({ transaction, onClose }: { transaction: Transaction; onClose: () => void }) {
  const { removeMany, updateGroup } = useTransactions()
  // Lista completa, não a filtrada pelo período: o grupo pode ter parcelas fora do filtro.
  const todas = useFinanceStore((s) => s.transactions)
  const moeda = useFinanceStore((s) => s.config?.moeda ?? 'BRL')
  const parcelas = parcelasDoGrupo(todas, transaction.grupoParcelas ?? '')
  const hoje = new Date().toISOString().split('T')[0]
  const futuras = parcelasFuturas(parcelas, hoje)
  const totalCentavos = Math.round(parcelas.reduce((s, p) => s + p.valor * 100, 0))
  const fmt = (v: number) => formatCurrency(v, moeda)

  const [modo, setModo] = useState<Modo>('resumo')
  const [trabalhando, setTrabalhando] = useState(false)

  const uid = useId()
  const id = (campo: string) => `${uid}-${campo}`
  const [descricao, setDescricao] = useState(descricaoBase(parcelas[0]?.descricao ?? transaction.descricao))
  const [total, setTotal] = useState(String(totalCentavos / 100))
  const [quantidade, setQuantidade] = useState(String(parcelas.length))
  const [primeiraData, setPrimeiraData] = useState(parcelas[0]?.data ?? transaction.data)
  const [erro, setErro] = useState<string | null>(null)

  async function excluir(alvo: Transaction[]) {
    setTrabalhando(true)
    await removeMany(alvo.map((p) => p.id))
    setTrabalhando(false)
    onClose()
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    const n = Number(quantidade)
    if (quantidade.trim() === '' || !Number.isInteger(n) || n < 2 || n > MAX_PARCELAS) {
      setErro(`Informe de 2 a ${MAX_PARCELAS} parcelas.`)
      return
    }
    let plano
    try {
      plano = planejarEdicaoDoGrupo({
        parcelas,
        novoTotal: parseFloat(total.replace(',', '.')),
        novaQuantidade: n,
        novaPrimeiraData: primeiraData,
        novaDescricao: descricao.trim(),
      })
    } catch {
      setErro('Confira o valor total e a data da 1ª parcela.')
      return
    }
    if (!descricao.trim()) {
      setErro('Informe a descrição.')
      return
    }
    setErro(null)
    setTrabalhando(true)
    await updateGroup(plano)
    setTrabalhando(false)
    onClose()
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-foreground">Parcelas de {descricaoBase(transaction.descricao)}</DialogTitle>
        <DialogDescription className="text-xs text-muted-foreground">
          {parcelas.length} parcelas · total{' '}
          <span className="font-mono tabular-nums">{fmt(totalCentavos / 100)}</span>
        </DialogDescription>
      </DialogHeader>

      {modo === 'resumo' && (
        <>
          <ul className="max-h-64 divide-y divide-border overflow-y-auto rounded-md border border-border">
            {parcelas.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span className="truncate text-foreground">{p.descricao}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <span className="text-xs tabular-nums text-muted-foreground">{formatDateBR(p.data)}</span>
                  <span className="font-mono tabular-nums text-foreground-secondary">{fmt(p.valor)}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setModo('editar')}>Editar todas</Button>
            <Button size="sm" variant="outline" className="border-border-strong" onClick={() => setModo('excluir-todas')}>
              Excluir todas
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-border-strong"
              disabled={futuras.length === 0}
              onClick={() => setModo('excluir-futuras')}
            >
              Excluir só as futuras
            </Button>
          </div>
          {futuras.length === 0 && (
            <p className="text-xs text-muted-foreground">Nenhuma parcela futura: todas já venceram.</p>
          )}
        </>
      )}

      {(modo === 'excluir-todas' || modo === 'excluir-futuras') && (
        <div className="space-y-4">
          <p role="alertdialog" className="text-sm text-foreground">
            {modo === 'excluir-todas'
              ? `Excluir as ${parcelas.length} parcelas?`
              : futuras.length === 1
              ? 'Excluir a parcela futura?'
              : `Excluir as ${futuras.length} parcelas futuras?`}
          </p>
          <p className="text-xs text-muted-foreground">Essa ação não pode ser desfeita.</p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              disabled={trabalhando}
              onClick={() => excluir(modo === 'excluir-todas' ? parcelas : futuras)}
            >
              {trabalhando ? 'Excluindo...' : 'Confirmar exclusão'}
            </Button>
            <Button size="sm" variant="outline" className="border-border-strong" onClick={() => setModo('resumo')}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {modo === 'editar' && (
        <form onSubmit={salvar} className="space-y-3">
          <div>
            <Label htmlFor={id('descricao')} className="text-xs text-muted-foreground">Descrição</Label>
            <Input
              id={id('descricao')}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="mt-1 h-8 border-border-strong bg-muted text-sm text-foreground"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor={id('total')} className="text-xs text-muted-foreground">Valor total (R$)</Label>
              <Input
                id={id('total')}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="mt-1 h-8 border-border-strong bg-muted font-mono text-sm tabular-nums text-foreground"
                required
              />
            </div>
            <div>
              <Label htmlFor={id('quantidade')} className="text-xs text-muted-foreground">Parcelas</Label>
              <Input
                id={id('quantidade')}
                type="number"
                inputMode="numeric"
                value={quantidade}
                onChange={(e) => {
                  setQuantidade(e.target.value)
                  setErro(null)
                }}
                className="mt-1 h-8 border-border-strong bg-muted text-sm text-foreground"
              />
            </div>
            <div>
              <Label htmlFor={id('data')} className="text-xs text-muted-foreground">Data da 1ª parcela</Label>
              <Input
                id={id('data')}
                type="date"
                value={primeiraData}
                onChange={(e) => setPrimeiraData(e.target.value)}
                className="mt-1 h-8 border-border-strong bg-muted text-xs text-foreground"
                required
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            O valor é rateado de novo entre todas as parcelas. As datas só mudam se você alterar a da 1ª parcela.
          </p>
          {erro && (
            <p role="alert" className="text-xs text-negative">
              {erro}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={trabalhando}>
              {trabalhando ? 'Salvando...' : 'Salvar alterações'}
            </Button>
            <Button type="button" size="sm" variant="outline" className="border-border-strong" onClick={() => setModo('resumo')}>
              Cancelar
            </Button>
          </div>
        </form>
      )}
    </>
  )
}
