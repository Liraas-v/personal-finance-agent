import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/layout/Providers'
import { ThemeProvider } from '@/components/layout/ThemeProvider'
import { ThemedToaster } from '@/components/layout/ThemedToaster'
import { DemoBanner } from '@/components/layout/DemoBanner'
import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { VoiceRecorder } from '@/components/voice/VoiceRecorder'
import { ServiceWorkerRegistration } from '@/components/layout/ServiceWorkerRegistration'
import { THEME_COLOR_DARK, THEME_COLOR_LIGHT } from '@/lib/theme'

const geistSans = Geist({ subsets: ['latin'], variable: '--font-geist-sans' })
const geistMono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' })

const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo'

export const metadata: Metadata = {
  title: 'Finance Agent',
  description: 'Agente financeiro pessoal local',
  manifest: '/manifest.json',
  // Arquivos gerados por scripts/generate-icons.mjs (npm run icons)
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '48x48' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: THEME_COLOR_LIGHT },
    { media: '(prefers-color-scheme: dark)', color: THEME_COLOR_DARK },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground min-h-screen`}>
        <ThemeProvider>
          <Providers>
            <DemoBanner />
            <Header />
            {/* pt-[84px] = 52px Header + 32px DemoBanner (h-8) stacked in demo mode; pt-[52px] = Header alone */}
            <main className={`${isDemoMode ? 'pt-[84px]' : 'pt-[52px]'} pb-16 sm:pb-0`}>{children}</main>
            <BottomNav />
            <VoiceRecorder />
            <ServiceWorkerRegistration />
            <ThemedToaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
