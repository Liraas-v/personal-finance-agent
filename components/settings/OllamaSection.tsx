'use client'
import { useState, useEffect } from 'react'
import { Bot, Wifi } from 'lucide-react'
import { useFinanceStore } from '@/lib/store'
import { getConfigRepository } from '@/lib/repositories'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'

const configRepository = getConfigRepository()

export function OllamaSection() {
  const config = useFinanceStore((s) => s.config)
  const updateConfig = useFinanceStore((s) => s.updateConfig)
  const [url, setUrl] = useState(config?.ollama.url ?? 'http://localhost:11434')
  const [model, setModel] = useState(config?.ollama.model ?? 'mistral')
  const [models, setModels] = useState<string[]>([])
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/ai/models')
      .then((r) => r.json())
      .then((d) => { if (d.models?.length) setModels(d.models) })
      .catch(() => {})
  }, [])

  async function testConnection() {
    setTesting(true)
    try {
      const res = await fetch('/api/ai/status')
      const data = await res.json()
      if (data.online) {
        toast.success(`Ollama online — modelo: ${data.model}`)
      } else {
        toast.error('Ollama offline. Execute: ollama serve')
      }
    } catch {
      toast.error('Não foi possível contatar o servidor')
    } finally {
      setTesting(false)
    }
  }

  async function save() {
    setSaving(true)
    try {
      const updated = await configRepository.update({ ollama: { url, model } })
      updateConfig({ ollama: updated.ollama })
      toast.success('Configuração salva')
    } catch {
      toast.error('Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#0f0f17] p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Bot size={16} className="text-violet-400" />
        <h3 className="font-semibold text-slate-200">Ollama</h3>
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-400 text-xs">URL do servidor</Label>
        <Input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="http://localhost:11434"
          className="bg-[#1e1e2e] border-[#2a2a3e] text-slate-200"
        />
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-400 text-xs">Modelo</Label>
        {models.length > 0 ? (
          <Select value={model} onValueChange={setModel}>
            <SelectTrigger className="bg-[#1e1e2e] border-[#2a2a3e] text-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#1e1e2e] border-[#2a2a3e]">
              {models.map((m) => (
                <SelectItem key={m} value={m} className="text-slate-200">{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="mistral"
            className="bg-[#1e1e2e] border-[#2a2a3e] text-slate-200"
          />
        )}
      </div>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          size="sm"
          onClick={testConnection}
          disabled={testing}
          className="gap-1.5 text-xs border-[#2a2a3e] text-slate-400"
        >
          <Wifi size={12} />
          {testing ? 'Testando...' : 'Testar conexão'}
        </Button>
        <Button
          size="sm"
          onClick={save}
          disabled={saving}
          className="text-xs bg-violet-700 hover:bg-violet-600"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </Button>
      </div>
    </div>
  )
}
