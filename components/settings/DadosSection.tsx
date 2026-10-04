'use client'
import { useRef, useState } from 'react'
import { Download, Upload, Trash2, Database } from 'lucide-react'
import { useFinanceStore } from '@/lib/store'
import { getTransactionRepository, getConfigRepository } from '@/lib/repositories'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { downloadBlob } from '@/lib/exportUtils'
import type { Transaction } from '@/types'

const transactionRepository = getTransactionRepository()
const configRepository = getConfigRepository()

export function DadosSection() {
  const { transactions, setTransactions, clearTransactions } = useFinanceStore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [clearing, setClearing] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function exportJson() {
    try {
      const config = await configRepository.read()
      const blob = new Blob(
        [JSON.stringify({ transactions, config }, null, 2)],
        { type: 'application/json' }
      )
      downloadBlob(blob, `finance-backup-${new Date().toISOString().slice(0, 10)}.json`)
      toast.success('Backup exportado')
    } catch {
      toast.error('Erro ao exportar backup')
    }
  }

  async function importJson(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      if (!Array.isArray(data.transactions)) throw new Error('Formato inválido')

      await transactionRepository.clear()
      for (const t of data.transactions as Transaction[]) {
        await transactionRepository.create(t)
      }

      const imported = await transactionRepository.list()
      setTransactions(imported)
      toast.success(`${imported.length} transações importadas`)
    } catch {
      toast.error('Arquivo inválido ou corrompido')
    } finally {
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function clearAll() {
    setClearing(true)
    try {
      await transactionRepository.clear()
      clearTransactions()
      toast.success('Todas as transações removidas')
    } catch {
      toast.error('Erro ao limpar dados')
    } finally {
      setClearing(false)
      setConfirmOpen(false)
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Database size={16} className="text-primary" />
        <h3 className="font-semibold text-foreground">Gestão de Dados</h3>
      </div>

      <div className="space-y-2">
        <button
          onClick={exportJson}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted rounded-lg text-sm text-foreground-secondary hover:bg-muted transition-colors"
        >
          <span className="flex items-center gap-2"><Download size={14} />Exportar backup JSON</span>
          <span className="text-xs text-primary">↓ Download</span>
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted rounded-lg text-sm text-foreground-secondary hover:bg-muted transition-colors"
        >
          <span className="flex items-center gap-2"><Upload size={14} />Importar backup</span>
          <span className="text-xs text-primary">↑ Upload</span>
        </button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importJson} />

        <button
          onClick={() => setConfirmOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-muted rounded-lg text-sm text-negative hover:bg-negative/10 transition-colors"
        >
          <span className="flex items-center gap-2"><Trash2 size={14} />Limpar todas as transações</span>
          <span className="text-xs text-negative">⚠ Danger</span>
        </button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Limpar todas as transações?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-foreground-secondary">
            Esta ação não pode ser desfeita. Todas as transações serão removidas permanentemente.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              className="border-border-strong text-foreground-secondary"
            >
              Cancelar
            </Button>
            <Button
              onClick={clearAll}
              disabled={clearing}
              className="bg-negative hover:bg-negative/90 text-primary-foreground"
            >
              {clearing ? 'Limpando...' : 'Sim, limpar tudo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
