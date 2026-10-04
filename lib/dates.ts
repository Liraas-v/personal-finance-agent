// Divide a string em vez de usar Date: new Date('2026-01-01') vira 31/12 em fusos negativos.
export function formatDateBR(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso
}
