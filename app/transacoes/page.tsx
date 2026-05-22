import { ExpenseForm } from '@/components/transactions/ExpenseForm'
import { ExpenseList } from '@/components/transactions/ExpenseList'
import { ExportDialog } from '@/components/export/ExportDialog'

export default function TransacoesPage() {
  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-4 sm:hidden">
        <h1 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Transações</h1>
        <ExportDialog />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[380px_1fr] gap-6">
        <div>
          <div className="hidden sm:flex items-center justify-between mb-4">
            <span className="text-xs text-slate-500">Nova transação</span>
            <ExportDialog />
          </div>
          <ExpenseForm />
        </div>
        <ExpenseList />
      </div>
    </div>
  )
}
