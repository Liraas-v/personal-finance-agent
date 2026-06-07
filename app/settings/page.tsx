import { Settings } from 'lucide-react'
import { OllamaSection } from '@/components/settings/OllamaSection'
import { StatusSection } from '@/components/settings/StatusSection'
import { MetasSection } from '@/components/settings/MetasSection'
import { DadosSection } from '@/components/settings/DadosSection'

const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo'

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-[600px] mx-auto pb-20 sm:pb-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={18} className="text-violet-400" />
        <h2 className="text-base font-semibold text-slate-200">Configurações</h2>
      </div>
      <div className="space-y-4">
        {!isDemoMode && <OllamaSection />}
        <StatusSection />
        <MetasSection />
        <DadosSection />
      </div>
    </div>
  )
}
