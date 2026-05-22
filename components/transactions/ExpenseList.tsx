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
      className="flex items-center gap-3 py-3 border-b border-[#1e1e2e] last:border-0 group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-200 truncate">{t.descricao}</span>
          <Badge variant="outline" className="text-[10px] py-0 text-slate-500 border-[#2a2a3e] gap-0.5">
            {ORIGEM_ICON[t.origem]}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-slate-600">{t.categoria}</span>
          <span className="text-xs text-slate-700">·</span>
          <span className="hidden sm:inline text-xs text-slate-600">{t.pagamento}</span>
          <span className="hidden sm:inline text-xs text-slate-700">·</span>
          <span className="text-xs text-slate-600">{t.data}</span>
        </div>
      </div>
      <span
        className={`text-sm font-semibold tabular-nums shrink-0 ${
          t.tipo === 'gasto' ? 'text-rose-400' : 'text-emerald-400'
        }`}
      >
        {t.tipo === 'gasto' ? '−' : '+'}{formatCurrency(t.valor, moeda)}
      </span>
      <button
        onClick={onEdit}
        aria-label={`Editar ${t.descricao}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-violet-400 p-1"
      >
        <Pencil size={14} />
      </button>
      <button
        onClick={onDelete}
        aria-label={`Remover ${t.descricao}`}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-rose-400 p-1"
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
    <div className="bg-[#0f0f17] border border-[#1e1e2e] rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-200">Transações</h3>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar..."
          className="h-7 text-xs bg-[#1e1e2e] border border-[#2a2a3e] rounded-md px-2 text-slate-300 w-40"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-slate-600 text-sm py-8">Nenhuma transação encontrada</p>
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
        <DialogContent className="bg-[#0f0f17] border-[#1e1e2e]">
          <DialogHeader>
            <DialogTitle className="text-slate-200">Editar transação</DialogTitle>
          </DialogHeader>
          {editing && <ExpenseForm transaction={editing} onDone={() => setEditing(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
