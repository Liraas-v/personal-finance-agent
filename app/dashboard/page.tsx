import { DashboardCards } from '@/components/dashboard/DashboardCards'
import { ExpenseChart } from '@/components/dashboard/ExpenseChart'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { InsightBanner } from '@/components/dashboard/InsightBanner'
import { ExportDialog } from '@/components/export/ExportDialog'

export default function DashboardPage() {
  return (
    <div className="p-4 sm:p-6 space-y-4 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Dashboard</h1>
        <ExportDialog />
      </div>
      <DashboardCards />
      <div className="grid grid-cols-1 sm:grid-cols-[1.4fr_1fr] gap-4">
        <ExpenseChart />
        <RecentTransactions />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr] gap-4">
        <CategoryChart />
        <InsightBanner />
      </div>
    </div>
  )
}
