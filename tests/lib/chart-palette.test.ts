import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

// Cores das categorias nos gráficos: cada categoria precisa ser reconhecível sozinha e distinguível das outras,
// nos dois temas. Antes eram 6 tons do mesmo azul (diferença visual quase nula entre vizinhos).
const css = readFileSync(path.resolve(__dirname, '../../app/globals.css'), 'utf8')

function tokens(re: RegExp): Record<string, string> {
  const body = css.match(re)?.[1] ?? ''
  const out: Record<string, string> = {}
  for (const m of body.matchAll(/--([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) out[m[1]] = m[2].toLowerCase()
  return out
}

const THEMES = {
  claro: tokens(/:root\s*\{([^}]*)\}/),
  escuro: tokens(/\.dark\s*\{([^}]*)\}/),
}

const CATS = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => `cat-${n}`)
const MIN_DELTA_E = 25
const MIN_CONTRAST = 3

function channel(hex: string, i: number): number {
  const c = parseInt(hex.slice(i, i + 2), 16) / 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(hex: string): number {
  return 0.2126 * channel(hex, 1) + 0.7152 * channel(hex, 3) + 0.0722 * channel(hex, 5)
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

// sRGB -> CIELAB (D65), para medir diferença percebida entre duas cores (ΔE76)
function lab(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => channel(hex, i))
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))]
}

function deltaE(a: string, b: string): number {
  const [l1, a1, b1] = lab(a)
  const [l2, a2, b2] = lab(b)
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2)
}

describe.each(Object.entries(THEMES))('paleta das categorias — tema %s', (_nome, t) => {
  it('define as 8 cores de categoria e a cor de "Outros"', () => {
    for (const k of [...CATS, 'chart-neutral']) expect(t[k], `token --${k} ausente`).toBeDefined()
  })

  it(`cada cor tem contraste ≥ ${MIN_CONTRAST}:1 sobre o card`, () => {
    for (const k of CATS) {
      expect(contrast(t[k], t['card']), `--${k} sobre card`).toBeGreaterThanOrEqual(MIN_CONTRAST)
    }
  })

  it(`quaisquer duas categorias (e "Outros") diferem em ΔE ≥ ${MIN_DELTA_E}`, () => {
    const nomes = [...CATS, 'chart-neutral']
    const pares: string[] = []
    for (let i = 0; i < nomes.length; i++) {
      for (let j = i + 1; j < nomes.length; j++) {
        const d = deltaE(t[nomes[i]], t[nomes[j]])
        if (d < MIN_DELTA_E) pares.push(`${nomes[i]} × ${nomes[j]} = ${d.toFixed(1)}`)
      }
    }
    expect(pares, `pares parecidos demais:\n${pares.join('\n')}`).toEqual([])
  })
})
