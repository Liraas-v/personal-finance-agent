'use client'
import { useState } from 'react'
import { Trash2, Mic, PenLine, ScanLine, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTransactions } from '@/hooks/useTransactions'
import { useFinanceStore } from '@/lib/store'
import { formatCurrency } from '@/lib/currency'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ExpenseForm } from './ExpenseForm'
import type { Transaction } from '@/types'

const ORIGEM_ICON = {
  voz: <Mic size={10} />,
  manual: <PenLine size={10} />,
  ocr: <ScanLine size={10} />,
}

function TransactionRow({
  t,
  onDelete,
  onEdit,
  moeda,
}: {
  t: Transaction
  onDelete: () => void
  onEdit: () => void
  moeda: string
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center gap-3 py-3 border-b border-border last:border-0 group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground truncate">{t.descricao}</span>
          <Badge variant="outline" className="text-xs py-0 text-muted-foreground border-border-strong gap-0.5">
            {ORIGEM_ICON[t.origem]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{t.categoria}</span>
          <span className="text-xs text-muted-foreground">·</span>
          <span className="hidden sm:inline text-xs text-muted-foreground">{t.pagamento}</span>
          <span className="hidden sm:inline text-xs text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{t.data}</span>
        </div>
      </div>
      <span
        className={`text-sm font-semibold tabular-nums shrink-0 ${
          t.tipo === 'gasto' ? 'text-negative' : 'text-positive'
        }`}
      >
        {t.tipo === 'gasto' ? '−' : '+'}{formatCurrency(t.valor, moeda)}
      </span>
      <button
        onClick={onEdit}
        aria-label={`Editar ${t.descricao}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary p-1"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={onDelete}
        aria-label={`Remover ${t.descricao}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-negative p-1"
      >
        <Trash2 size={14} />
      </button>
    </motion.div>
  )
}

export function ExpenseList() {
  const { transactions, remove } = useTransactions()
  const moeda = useFinanceStore((s) => s.config?.moeda ?? 'BRL')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Transaction | null>(null)

  const filtered = transactions.filter(
    (t) =>
      t.descricao.toLowerCase().includes(search.toLowerCase()) ||
      t.categoria.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground">Transações</h3>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="h-7 text-xs bg-muted border border-border-strong rounded-md px-2 text-foreground-secondary w-40"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">Nenhuma transação encontrada</p>
      ) : (
        <AnimatePresence mode="popLayout">
          {filtered.map((t) => (
            <TransactionRow
              key={t.id}
              t={t}
              onDelete={() => remove(t.id)}
              onEdit={() => setEditing(t)}
              moeda={moeda}
            />
          ))}
        </AnimatePresence>
      )}

      <Dialog open={editing !== null} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Editar transação</DialogTitle>
          </DialogHeader>
          {editing && <ExpenseForm transaction={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
