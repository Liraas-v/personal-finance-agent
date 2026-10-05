'use client'
import { useId, useState } from 'react'
import { PlusCircle, Save } from 'lucide-react'
import { motion } from 'framer-motion'
import { v4 as uuidv4 } from 'uuid'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTransactions } from '@/hooks/useTransactions'
import { useFinanceStore } from '@/lib/store'
import { ALL_CATEGORIES } from '@/lib/categories'
import { formatCurrency } from '@/lib/currency'
import { MAX_PARCELAS, splitInstallments } from '@/lib/installments'
import type { Transaction, TipoTransacao, FormaPagamento, OrigemTransacao } from '@/types'

interface ExpenseFormProps {
  defaultValues?: {
    descricao?: string
    valor?: number
    data?: string
  }
  origem?: OrigemTransacao
  transaction?: Transaction
  onDone?: () => void
}

const MIN_PARCELAS = 2
const MSG_PARCELAS = `Informe de ${MIN_PARCELAS} a ${MAX_PARCELAS} parcelas.`

export function ExpenseForm({ defaultValues, origem = 'manual', transaction, onDone }: ExpenseFormProps) {
  const { create, createMany, update } = useTransactions()
  const moeda = useFinanceStore((s) => s.config?.moeda ?? 'BRL')
  const isEditing = transaction !== undefined
  const today = new Date().toISOString().split('T')[0]
  const uid = useId()
  const id = (campo: string) => `${uid}-${campo}`

  const [tipo, setTipo] = useState<TipoTransacao>(transaction?.tipo ?? 'gasto')
  const [descricao, setDescricao] = useState(transaction?.descricao ?? defaultValues?.descricao ?? '')
  const [valor, setValor] = useState((transaction?.valor ?? defaultValues?.valor)?.toString() ?? '')
  const [categoria, setCategoria] = useState(transaction?.categoria ?? 'Outros')
  const [pagamento, setPagamento] = useState<FormaPagamento>(transaction?.pagamento ?? 'crédito')
  const [data, setData] = useState(transaction?.data ?? defaultValues?.data ?? today)
  const [parcelas, setParcelas] = useState(String(MIN_PARCELAS))
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Parcelar só vale ao criar: ao editar, mexe-se em uma parcela já lançada.
  const parcelando = pagamento === 'parcelado' && !isEditing
  const valorNumerico = parseFloat(valor.replace(',', '.'))
  const nParcelas = Number(parcelas)
  const parcelasValidas =
    parcelas.trim() !== '' && Number.isInteger(nParcelas) && nParcelas >= MIN_PARCELAS && nParcelas <= MAX_PARCELAS

  function previa(): string | null {
    if (!parcelando || !parcelasValidas || isNaN(valorNumerico) || valorNumerico <= 0) return null
    try {
      const itens = splitInstallments({ total: valorNumerico, parcelas: nParcelas, primeiraData: data || today, descricao: 'x' })
      const primeira = itens[0].valor
      const ultima = itens[itens.length - 1].valor
      const base = `${nParcelas}x de ${formatCurrency(primeira, moeda)}`
      return ultima === primeira ? base : `${base} (última de ${formatCurrency(ultima, moeda)})`
    } catch {
      return null
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!descricao || isNaN(valorNumerico) || valorNumerico <= 0) return

    if (parcelando) {
      if (!parcelasValidas) {
        setErro(MSG_PARCELAS)
        return
      }
      let lote
      try {
        lote = splitInstallments({
          total: valorNumerico,
          parcelas: nParcelas,
          primeiraData: data,
          descricao,
          grupoParcelas: uuidv4(),
        })
      } catch {
        setErro('Confira o valor total e a data da 1ª parcela.')
        return
      }
      setErro(null)
      setLoading(true)
      await createMany(
        lote.map((p) => ({
          tipo,
          descricao: p.descricao,
          valor: p.valor,
          categoria,
          pagamento,
          parcelas: p.parcelas,
          grupoParcelas: p.grupoParcelas,
          data: p.data,
          origem,
        }))
      )
      setDescricao('')
      setValor('')
      setLoading(false)
      onDone?.()
      return
    }

    setLoading(true)
    if (isEditing) {
      await update(transaction.id, { tipo, descricao, valor: valorNumerico, categoria, pagamento, data })
    } else {
      await create({ tipo, descricao, valor: valorNumerico, categoria, pagamento, data, origem })
      setDescricao('')
      setValor('')
    }
    setLoading(false)
    onDone?.()
  }

  const textoPrevia = previa()

  return (
    <motion.form
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="bg-card border border-border rounded-lg p-5 space-y-4"
    >
      <h3 className="text-sm font-semibold text-foreground">
        {isEditing ? 'Editar transação' : 'Nova transação'}
      </h3>

      <div className="flex gap-2">
        {(['gasto', 'receita'] as TipoTransacao[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTipo(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tipo === t
                ? t === 'gasto'
                  ? 'bg-negative/15 text-foreground border border-negative/60'
                  : 'bg-positive/15 text-foreground border border-positive/60'
                : 'bg-muted text-muted-foreground border border-transparent'
            }`}
          >
            {t === 'gasto' ? '− Gasto' : '+ Receita'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={id('descricao')} className="text-xs text-muted-foreground">Descrição</Label>
          <Input
            id={id('descricao')}
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="iFood, Salário..."
            className="mt-1 bg-muted border-border-strong text-foreground text-sm h-8"
            required
          />
        </div>
        <div>
          <Label htmlFor={id('valor')} className="text-xs text-muted-foreground">
            {parcelando ? 'Valor total (R$)' : 'Valor (R$)'}
          </Label>
          <Input
            id={id('valor')}
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="0,00"
            className="mt-1 bg-muted border-border-strong text-foreground text-sm h-8"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <Label htmlFor={id('categoria')} className="text-xs text-muted-foreground">Categoria</Label>
          <select
            id={id('categoria')}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 w-full h-8 bg-muted border border-border-strong rounded-md text-foreground text-xs px-2"
          >
            {ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label htmlFor={id('pagamento')} className="text-xs text-muted-foreground">Pagamento</Label>
          <select
            id={id('pagamento')}
            value={pagamento}
            onChange={(e) => setPagamento(e.target.value as FormaPagamento)}
            className="mt-1 w-full h-8 bg-muted border border-border-strong rounded-md text-foreground text-xs px-2"
          >
            {(['crédito','débito','pix','dinheiro','parcelado'] as FormaPagamento[]).map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor={id('data')} className="text-xs text-muted-foreground">
            {parcelando ? 'Data da 1ª parcela' : 'Data'}
          </Label>
          <Input
            id={id('data')}
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="mt-1 bg-muted border-border-strong text-foreground text-xs h-8"
            required
          />
        </div>
      </div>

      {parcelando && (
        <div className="grid grid-cols-3 gap-3">
          <div>
            <Label htmlFor={id('parcelas')} className="text-xs text-muted-foreground">Parcelas</Label>
            <Input
              id={id('parcelas')}
              type="number"
              inputMode="numeric"
              aria-describedby={erro ? id("erro") : undefined}
              value={parcelas}
              onChange={(e) => {
                setParcelas(e.target.value)
                setErro(null)
              }}
              className="mt-1 bg-muted border-border-strong text-foreground text-sm h-8"
            />
          </div>
          <p
            data-testid="previa-parcelas"
            className="col-span-2 self-end pb-1.5 font-mono text-xs tabular-nums text-foreground-secondary"
          >
            {textoPrevia ?? 'Informe o valor total e as parcelas'}
          </p>
        </div>
      )}

      {erro && (
        <p id={id("erro")} role="alert" className="text-xs text-negative">
          {erro}
        </p>
      )}

      <Button
        type="submit"
        disabled={loading}
        size="sm"
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
      >
        {isEditing ? <Save size={14} /> : <PlusCircle size={14} />}
        {loading ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Adicionar'}
      </Button>
    </motion.form>
  )
}
