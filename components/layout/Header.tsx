'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TrendingUp, Settings } from 'lucide-react'
import { DateRangePicker } from '@/components/layout/DateRangePicker'
import { ThemeSelect } from '@/components/layout/ThemeSelect'

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
      className={`fixed left-0 right-0 z-40 flex h-[52px] items-center border-b border-border bg-card px-4 sm:px-6 ${
        isDemoMode ? 'top-8' : 'top-0'
      }`}
    >
      <div className="mr-4 flex shrink-0 items-center gap-2 sm:mr-8">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
          <TrendingUp size={14} className="text-primary-foreground" />
        </div>
        <span className="text-sm font-semibold text-foreground">Finance Agent</span>
      </div>

      <nav className="hidden flex-1 gap-0 sm:flex">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex h-[52px] items-center px-4 text-sm transition-colors ${
              pathname.startsWith(tab.href)
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden sm:block">
          <ThemeSelect />
        </div>
        <Link
          href="/settings"
          className={`hidden rounded-md p-1.5 transition-colors sm:flex ${
            pathname.startsWith('/settings') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
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
