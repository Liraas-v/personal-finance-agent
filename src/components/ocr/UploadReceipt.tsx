'use client'
import { useState } from 'react'
import { ScanLine, Upload, CheckCircle2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExpenseForm } from '@/components/transactions/ExpenseForm'
import type { OcrResult } from '@/types'

export function UploadReceipt() {
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<OcrResult | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const processFile = async (file: File) => {
    if (!file) return
    setProcessing(true)
    setError(null)
    setResult(null)

    if (file.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(file))
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/ocr', { method: 'POST', body: formData })
      if (!res.ok) throw new Error('OCR falhou')
      const data: OcrResult = await res.json()
      setResult(data)
    } catch {
      setError('Não foi possível extrair dados do arquivo. Tente uma imagem mais nítida.')
    } finally {
      setProcessing(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const reset = () => {
    setResult(null)
    setPreview(null)
    setError(null)
  }

  return (
    <div className="max-w-[700px] mx-auto space-y-4">
      <AnimatePresence mode="wait">
        {!result ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <label
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center h-56 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
                isDragging
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-border-strong hover:border-primary bg-card'
              }`}
            >
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={handleInput}
              />
              {processing ? (
                <div className="text-center">
                  <ScanLine size={32} className="text-primary mx-auto mb-2 animate-pulse" />
                  <p className="text-sm text-foreground-secondary">Processando com Tesseract...</p>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={32} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-foreground-secondary">Arraste um comprovante ou clique para selecionar</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou PDF</p>
                </div>
              )}
            </label>

            {preview && (
              <div className="mt-3 rounded-lg overflow-hidden border border-border max-h-64">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="preview" className="w-full object-contain max-h-64" />
              </div>
            )}

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3 flex items-center gap-2 p-3 bg-negative/10 border border-negative/20 rounded-lg text-sm text-negative"
              >
                <X size={14} />
                {error}
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4 p-3 bg-positive/10 border border-positive/20 rounded-lg">
              <CheckCircle2 size={16} className="text-positive" />
              <span className="text-sm text-foreground">Dados extraídos com sucesso. Revise e confirme.</span>
              <button onClick={reset} className="ml-auto text-muted-foreground hover:text-foreground-secondary">
                <X size={14} />
              </button>
            </div>
            <ExpenseForm
              defaultValues={{
                descricao: result.estabelecimento,
                valor: result.valor,
                data: result.data,
              }}
              origem="ocr"
            />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
