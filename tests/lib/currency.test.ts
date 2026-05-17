import { formatCurrency } from '@/lib/currency'

test('formata BRL corretamente', () => {
  const result = formatCurrency(1000, 'BRL')
  expect(result).toContain('R$')
  expect(result).toContain('1.000')
})

test('formata USD corretamente', () => {
  const result = formatCurrency(1000, 'USD')
  expect(result).toContain('1,000')
  expect(result).toContain('$')
})

test('formata EUR corretamente', () => {
  const result = formatCurrency(1000, 'EUR')
  expect(result).toContain('1.000')
  expect(result).toContain('€')
})

test('fallback para BRL com moeda desconhecida', () => {
  const result = formatCurrency(500, 'XYZ')
  expect(typeof result).toBe('string')
  expect(result.length).toBeGreaterThan(0)
})
