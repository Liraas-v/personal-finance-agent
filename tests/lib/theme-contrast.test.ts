import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { THEME_COLOR_LIGHT, THEME_COLOR_DARK } from '@/lib/theme'

const css = readFileSync(path.resolve(__dirname, '../../src/app/globals.css'), 'utf8')

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

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (hi + 0.05) / (lo + 0.05)
}

describe.each(Object.entries(THEMES))('contraste — tema %s', (_nome, t) => {
  it('define todos os tokens esperados', () => {
    for (const k of [
      'background', 'card', 'muted', 'border', 'border-strong', 'foreground', 'foreground-secondary',
      'muted-foreground', 'primary', 'primary-foreground', 'positive', 'negative', 'warning', 'chart-neutral',
    ]) {
      expect(t[k], `token --${k} ausente`).toBeDefined()
    }
  })

  const textos = ['foreground', 'foreground-secondary', 'muted-foreground']
  const fundos = ['background', 'card', 'muted']
  for (const fg of textos) {
    for (const bg of fundos) {
      it(`${fg} sobre ${bg} ≥ 4.5`, () => {
        expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5)
      })
    }
  }

  for (const cor of ['primary', 'positive', 'negative', 'warning']) {
    for (const bg of ['background', 'card']) {
      it(`${cor} sobre ${bg} ≥ 4.5`, () => {
        expect(contrast(t[cor], t[bg])).toBeGreaterThanOrEqual(4.5)
      })
    }
  }

  it('primary-foreground sobre primary ≥ 4.5', () => {
    expect(contrast(t['primary-foreground'], t['primary'])).toBeGreaterThanOrEqual(4.5)
  })

  it('chart-neutral sobre card ≥ 3', () => {
    expect(contrast(t['chart-neutral'], t['card'])).toBeGreaterThanOrEqual(3)
  })
})

describe('theme-color', () => {
  it('constantes de lib/theme.ts batem com o --background de cada tema', () => {
    expect(THEME_COLOR_LIGHT.toLowerCase()).toBe(THEMES.claro['background'])
    expect(THEME_COLOR_DARK.toLowerCase()).toBe(THEMES.escuro['background'])
  })
})
