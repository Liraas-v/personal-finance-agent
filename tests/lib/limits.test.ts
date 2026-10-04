import { describe, it, expect } from 'vitest'
import { limitStatus } from '@/lib/limits'

describe('limitStatus', () => {
  it('sem limite (0, negativo ou NaN) é "none" e pct 0', () => {
    for (const l of [0, -5, NaN]) expect(limitStatus(100, l)).toEqual({ status: 'none', pct: 0 })
  })
  it('gasto 0 com limite é ok e 0%', () => {
    expect(limitStatus(0, 500)).toEqual({ status: 'ok', pct: 0 })
  })
  it('até 80% é ok', () => {
    expect(limitStatus(400, 500)).toEqual({ status: 'ok', pct: 80 })
  })
  it('acima de 80% até 100% é warning', () => {
    expect(limitStatus(450, 500).status).toBe('warning')
    expect(limitStatus(500, 500)).toEqual({ status: 'warning', pct: 100 })
  })
  it('acima de 100% é over e o pct fica em 100', () => {
    expect(limitStatus(600, 500)).toEqual({ status: 'over', pct: 100 })
  })
  it('gasto negativo é tratado como 0', () => {
    expect(limitStatus(-50, 500)).toEqual({ status: 'ok', pct: 0 })
  })
})
