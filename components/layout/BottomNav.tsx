'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart2, CreditCard, Target, Lightbulb, MessageSquare } from 'lucide-react'

const TABS = [
  { label: 'Dashboard', href: '/dashboard', icon: BarChart2 },
  { label: 'Transações', href: '/transacoes', icon: CreditCard },
  { label: 'Metas', href: '/metas', icon: Target },
  { label: 'Insights', href: '/insights', icon: Lightbulb },
  { label: 'Chat', href: '/chat', icon: MessageSquare },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex sm:hidden h-14 border-t border-border bg-card">
      {TABS.map(({ label, href, icon: Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
