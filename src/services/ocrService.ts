// services/ocrService.ts
import Tesseract from 'tesseract.js'
import type { OcrResult } from '@/types'

const VALUE_REGEX = /R\$\s*(\d+(?:[.,]\d{1,2})?)/gi
const DATE_REGEX = /(\d{2})[\/\-](\d{2})[\/\-](\d{2,4})/

export async function extractFromImage(imagePath: string): Promise<OcrResult> {
  const {
    data: { text },
  } = await Tesseract.recognize(imagePath, 'por', {
    logger: () => {},
  })

  // Extract largest monetary value (usually the total)
  const valueMatches = [...text.matchAll(VALUE_REGEX)]
  let valor: number | undefined
  if (valueMatches.length > 0) {
    const values = valueMatches.map((m) => parseFloat(m[1].replace(',', '.')))
    valor = Math.max(...values)
  }

  // Extract date
  const dateMatch = text.match(DATE_REGEX)
  let data: string | undefined
  if (dateMatch) {
    const [, day, month, year] = dateMatch
    const fullYear = year.length === 2 ? `20${year}` : year
    data = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  // First non-empty line = establishment name
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const estabelecimento = lines[0]

  return { valor, estabelecimento, data }
}
