import { Settings } from 'lucide-react'
import { OllamaSection } from '@/components/settings/OllamaSection'
import { StatusSection } from '@/components/settings/StatusSection'
import { MetasSection } from '@/components/settings/MetasSection'
import { DadosSection } from '@/components/settings/DadosSection'
import { AparenciaSection } from '@/components/settings/AparenciaSection'

const isDemoMode = process.env.NEXT_PUBLIC_APP_MODE === 'demo'

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 max-w-[600px] mx-auto pb-20 sm:pb-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings size={18} className="text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Configurações</h2>
      </div>
      <div className="space-y-4">
        <AparenciaSection />
        {!isDemoMode && <OllamaSection />}
        <StatusSection />
        <MetasSection />
        <DadosSection />
      </div>
    </div>
  )
}
