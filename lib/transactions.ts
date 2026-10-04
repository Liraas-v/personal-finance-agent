import type { Transaction } from '@/types'

// Mais recente primeiro. Desempate pela ordem original: o store insere as novas no início,
// então, na mesma data, a transação lançada por último aparece antes.
export function sortByDateDesc(list: Transaction[]): Transaction[] {
  return list
    .map((t, i) => ({ t, i }))
    .sort((a, b) => (a.t.data === b.t.data ? a.i - b.i : a.t.data < b.t.data ? 1 : -1))
    .map(({ t }) => t)
}
