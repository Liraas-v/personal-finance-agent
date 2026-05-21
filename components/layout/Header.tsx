'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Settings } from 'lucide-react'
import { DateRangePicker } from '@/components/layout/DateRangePicker'

const TABS = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Transações', href: '/transacoes' },
  { label: 'Metas', href: '/metas' },
  { label: 'Insights', href: '/insights' },
  { label: 'OCR', href: '/ocr' },
  { label: 'Chat', href: '/chat' },
]

const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo'

export function Header() {
  const pathname = usePathname()

  return (
    <header
      className={`fixed left-0 right-0 z-40 h-[52px] bg-[#0f0f17] border-b border-[#1e1e2e] flex items-center px-4 sm:px-6 ${
        isDemoMode ? 'top-9' : 'top-0'
      }`}
    >
      <div className="flex items-center gap-2 mr-4 sm:mr-8 shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <TrendingUp size={14} className="text-white" />
        </div>
        <span className="font-semibold text-sm text-slate-100">Finance Agent</span>
      </div>

      <nav className="hidden sm:flex gap-0 flex-1">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 h-[52px] flex items-center text-sm transition-colors ${
              pathname.startsWith(tab.href)
                ? 'text-slate-100 border-b-2 border-violet-500'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <Link
          href="/settings"
          className={`hidden sm:flex p-1.5 rounded-lg transition-colors ${
            pathname.startsWith('/settings')
              ? 'text-violet-400'
              : 'text-slate-600 hover:text-slate-400'
          }`}
          title="Configurações"
        >
          <Settings size={16} />
        </Link>
        <DateRangePicker />
      </div>
    </header>
  )
}
