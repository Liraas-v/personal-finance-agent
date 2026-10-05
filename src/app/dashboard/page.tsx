import { BalanceSummary } from '@/components/dashboard/BalanceSummary'
import { ExpenseChart } from '@/components/dashboard/ExpenseChart'
import { CategoryChart } from '@/components/dashboard/CategoryChart'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { InsightBanner } from '@/components/dashboard/InsightBanner'
import { ExportDialog } from '@/components/export/ExportDialog'

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-[1400px] space-y-4 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Dashboard</h1>
        <ExportDialog />
      </div>
      <BalanceSummary />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1.4fr_1fr]">
        <ExpenseChart />
        <RecentTransactions />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_1fr]">
        <CategoryChart />
        <InsightBanner />
      </div>
    </div>
  )
}
