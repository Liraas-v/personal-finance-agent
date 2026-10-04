import { ScanLine } from 'lucide-react'
import { UploadReceipt } from '@/components/ocr/UploadReceipt'

export default function OcrPage() {
  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-6 max-w-[700px] mx-auto">
        <ScanLine size={18} className="text-primary" />
        <h2 className="text-base font-semibold text-foreground">Scan de Comprovante</h2>
      </div>
      <UploadReceipt />
    </div>
  )
}
