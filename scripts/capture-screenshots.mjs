import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const OUT_DIR = 'public/screenshots'
mkdirSync(OUT_DIR, { recursive: true })

const pages = [
  { path: '/dashboard', file: 'dashboard.png' },
  { path: '/transacoes', file: 'transacoes.png' },
  { path: '/chat', file: 'chat.png' },
  { path: '/ocr', file: 'ocr.png' },
]

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

for (const { path, file } of pages) {
  await page.goto(`http://localhost:3000${path}`, { waitUntil: 'networkidle' })
  await page.screenshot({ path: `${OUT_DIR}/${file}` })
  console.log(`✓ ${file}`)
}

await browser.close()
