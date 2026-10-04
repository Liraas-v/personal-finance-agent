'use client'
import { useState } from 'react'
import { PlusCircle, Save } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTransactions } from '@/hooks/useTransactions'
import { ALL_CATEGORIES } from '@/lib/categories'
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

export function ExpenseForm({ defaultValues, origem = 'manual', transaction, onDone }: ExpenseFormProps) {
  const { create, update } = useTransactions()
  const isEditing = transaction !== undefined
  const today = new Date().toISOString().split('T')[0]

  const [tipo, setTipo] = useState<TipoTransacao>(transaction?.tipo ?? 'gasto')
  const [descricao, setDescricao] = useState(transaction?.descricao ?? defaultValues?.descricao ?? '')
  const [valor, setValor] = useState((transaction?.valor ?? defaultValues?.valor)?.toString() ?? '')
  const [categoria, setCategoria] = useState(transaction?.categoria ?? 'Outros')
  const [pagamento, setPagamento] = useState<FormaPagamento>(transaction?.pagamento ?? 'crédito')
  const [data, setData] = useState(transaction?.data ?? defaultValues?.data ?? today)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = parseFloat(valor.replace(',', '.'))
    if (!descricao || isNaN(v) || v <= 0) return

    setLoading(true)
    if (isEditing) {
      await update(transaction.id, { tipo, descricao, valor: v, categoria, pagamento, data })
    } else {
      await create({ tipo, descricao, valor: v, categoria, pagamento, data, origem })
      setDescricao('')
      setValor('')
    }
    setLoading(false)
    onDone?.()
  }

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
                  ? 'bg-negative/20 text-negative border border-negative/30'
                  : 'bg-positive/20 text-positive border border-positive/30'
                : 'bg-muted text-muted-foreground border border-transparent'
            }`}
          >
            {t === 'gasto' ? '− Gasto' : '+ Receita'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-muted-foreground">Descrição</Label>
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="iFood, Salário..."
            className="mt-1 bg-muted border-border-strong text-foreground text-sm h-8"
            required
          />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Valor (R$)</Label>
          <Input
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
          <Label className="text-xs text-muted-foreground">Categoria</Label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="mt-1 w-full h-8 bg-muted border border-border-strong rounded-md text-foreground text-xs px-2"
          >
            {ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">Pagamento</Label>
          <select
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
          <Label className="text-xs text-muted-foreground">Data</Label>
          <Input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="mt-1 bg-muted border-border-strong text-foreground text-xs h-8"
          />
        </div>
      </div>

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
