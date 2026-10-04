'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Lightbulb, MoreHorizontal, ScanLine, Settings } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ThemeSelect } from '@/components/layout/ThemeSelect'

export const MORE_LINKS = [
  { label: 'Insights', href: '/insights', icon: Lightbulb },
  { label: 'OCR', href: '/ocr', icon: ScanLine },
  { label: 'Configurações', href: '/settings', icon: Settings },
]

export function MoreSheet() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const active = MORE_LINKS.some((l) => pathname.startsWith(l.href))

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Mais"
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 transition-colors ${
            active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <MoreHorizontal size={18} strokeWidth={active ? 2.5 : 1.8} />
          <span className="text-xs font-medium">Mais</span>
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="border-border bg-card">
        <SheetHeader>
          <SheetTitle className="text-foreground">Mais</SheetTitle>
        </SheetHeader>
        <nav className="mt-4 flex flex-col gap-1">
          {MORE_LINKS.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-foreground-secondary transition-colors hover:bg-muted hover:text-foreground"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-foreground-secondary">Tema</span>
          <ThemeSelect showLabels />
        </div>
      </SheetContent>
    </Sheet>
  )
}
