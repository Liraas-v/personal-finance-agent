// app/api/ocr/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import path from 'path'
import os from 'os'
import { extractFromImage } from '@/services/ocrService'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop() ?? 'png'
  // os.tmpdir() é o único diretório gravável em ambientes serverless (Vercel usa /tmp)
  const uploadsDir = path.join(os.tmpdir(), 'finance-agent-uploads')
  const tmpPath = path.join(uploadsDir, `${uuidv4()}.${ext}`)

  await mkdir(uploadsDir, { recursive: true })
  await writeFile(tmpPath, buffer)

  try {
    const result = await extractFromImage(tmpPath)
    return NextResponse.json(result)
  } finally {
    await unlink(tmpPath).catch(() => {})
  }
}
