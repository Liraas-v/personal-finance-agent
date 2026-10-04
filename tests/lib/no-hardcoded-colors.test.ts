import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '../..')
const SCAN_DIRS = ['app', 'components']
const EXEMPT = new Set(['app/globals.css'])

// Arquivos ainda não migrados. Cada task de migração remove os seus daqui; ao final a lista fica vazia.
const PENDING = new Set<string>([
  'app/chat/page.tsx',
  'app/insights/page.tsx',
  'app/ocr/page.tsx',
  'app/settings/page.tsx',
  'components/chat/ChatPanel.tsx',
  'components/chat/ChatSidebar.tsx',
  'components/export/ExportDialog.tsx',
  'components/goals/GoalsPanel.tsx',
  'components/insights/InsightCard.tsx',
  'components/layout/DateRangePicker.tsx',
  'components/ocr/UploadReceipt.tsx',
  'components/settings/DadosSection.tsx',
  'components/settings/MetasSection.tsx',
  'components/settings/OllamaSection.tsx',
  'components/settings/StatusSection.tsx',
  'components/voice/VoiceRecorder.tsx',
])

const PALETTE =
  '(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)'

const RULES: { nome: string; re: RegExp }[] = [
  { nome: 'hex hardcoded', re: /#[0-9a-fA-F]{3,8}\b/ },
  { nome: 'cor da paleta Tailwind', re: new RegExp(String.raw`\b[a-z:]*(bg|text|border|ring|outline|from|to|via|fill|stroke|divide)-${PALETTE}-\d{2,3}`) },
  { nome: 'gradiente', re: /gradient/ },
  { nome: 'branco/preto fixo', re: /\b(text|bg|border)-(white|black)\b/ },
  { nome: 'raio acima de 8px', re: /rounded-(xl|2xl|3xl)\b/ },
  { nome: 'texto abaixo de 12px', re: /text-\[(9|10|11)px\]|fontSize:\s*(9|10|11)\b/ },
]

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((nome) => {
    const full = path.join(dir, nome)
    if (statSync(full).isDirectory()) return walk(full)
    return /\.(ts|tsx|css)$/.test(nome) ? [full] : []
  })
}

function violacoes(arquivoAbs: string): string[] {
  const linhas = readFileSync(arquivoAbs, 'utf8').split('\n')
  const out: string[] = []
  linhas.forEach((linha, i) => {
    for (const { nome, re } of RULES) {
      if (re.test(linha)) out.push(`  L${i + 1} [${nome}] ${linha.trim().slice(0, 110)}`)
    }
  })
  return out
}

const arquivos = SCAN_DIRS.flatMap((d) => walk(path.join(ROOT, d))).map((abs) => ({
  abs,
  rel: path.relative(ROOT, abs).split(path.sep).join('/'),
}))

describe('sem cores hardcoded', () => {
  it('arquivos migrados não têm violações', () => {
    const falhas = arquivos
      .filter(({ rel }) => !EXEMPT.has(rel) && !PENDING.has(rel))
      .map(({ abs, rel }) => ({ rel, v: violacoes(abs) }))
      .filter(({ v }) => v.length > 0)
    const msg = falhas.map(({ rel, v }) => `${rel}\n${v.join('\n')}`).join('\n')
    expect(falhas, `\n${msg}`).toEqual([])
  })

  it('arquivos em PENDING ainda têm violações (senão remova da lista)', () => {
    const limpos = arquivos
      .filter(({ rel }) => PENDING.has(rel))
      .filter(({ abs }) => violacoes(abs).length === 0)
      .map(({ rel }) => rel)
    expect(limpos, 'estes arquivos já estão limpos: remova-os de PENDING').toEqual([])
  })

  it('PENDING só lista arquivos que existem', () => {
    const existentes = new Set(arquivos.map((a) => a.rel))
    expect([...PENDING].filter((p) => !existentes.has(p))).toEqual([])
  })
})
