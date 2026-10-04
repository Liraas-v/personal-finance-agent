import { chromium } from 'playwright'
import { mkdirSync } from 'fs'

const THEME = process.env.THEME === 'light' ? 'light' : 'dark'
const OUT_DIR = process.env.OUT_DIR ?? '.tmp/screenshots'
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'
const WIDTH = Number(process.env.WIDTH ?? 1280)
const PAGES = (process.env.PAGES ?? 'dashboard,transacoes,metas,insights,ocr,chat,settings').split(',')

mkdirSync(OUT_DIR, { recursive: true })

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || undefined })
const context = await browser.newContext({
  viewport: { width: WIDTH, height: 800 },
  colorScheme: THEME,
})
// next-themes lê a chave "theme" do localStorage; fixa o tema independente do SO
await context.addInitScript((t) => localStorage.setItem('theme', t), THEME)
const page = await context.newPage()

for (const name of PAGES) {
  await page.goto(`${BASE_URL}/${name}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500) // deixa as animações dos gráficos terminarem
  await page.screenshot({ path: `${OUT_DIR}/${name}.png`, fullPage: true })
  console.log(`✓ ${name} (${THEME})`)
}

await browser.close()
