import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'
import { ServiceWorkerRegistration } from '@/components/layout/ServiceWorkerRegistration'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo'

export const metadata: Metadata = {
  title: 'Finance Agent',
  description: 'Agente financeiro pessoal local',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#7c3aed',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-[#0a0a0f] text-slate-100 min-h-screen`}>
        <Providers>
          <DemoBanner />
          <Header />
          {/* pt-[88px] = 52px Header + 36px DemoBanner (h-9) stacked in demo mode; pt-[52px] = Header alone */}
          <main className={`${isDemoMode ? 'pt-[88px]' : 'pt-[52px]'} pb-16 sm:pb-0`}>{children}</main>
          <BottomNav />
          <VoiceRecorder />
          <ServiceWorkerRegistration />
          <Toaster theme="dark" position="top-right" richColors />
        </Providers>
      </body>
    </html>
  )
}
