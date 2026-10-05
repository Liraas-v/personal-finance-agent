import type { Transaction } from '@/types'
import { formatCurrency } from '@/lib/currency'

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  try {
    a.click()
  } finally {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

export function exportCSV(transactions: Transaction[], filename: string) {
  const header = 'id,data,descricao,categoria,valor,tipo,pagamento,parcelas,origem,grupo_parcelas'
  const rows = transactions.map((t) =>
    [
      t.id,
      t.data,
      `"${t.descricao.replace(/"/g, '""')}"`,
      t.categoria,
      t.valor.toFixed(2),
      t.tipo,
      t.pagamento,
      t.parcelas ?? '',
      t.origem,
      t.grupoParcelas ?? '',
    ].join(',')
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, filename)
}

export async function exportPDF(
  transactions: Transaction[],
  periodo: string,
  filename: string,
  moeda = 'BRL'
) {
  const { default: jsPDF } = await import('jspdf')
  const { default: autoTable } = await import('jspdf-autotable')

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const fmt = (v: number) => formatCurrency(v, moeda)

  doc.setFillColor(15, 15, 23)
  doc.rect(0, 0, 210, 30, 'F')
  doc.setTextColor(139, 92, 246)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('Finance Agent', 14, 14)
  doc.setTextColor(148, 163, 184)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Relatório — ${periodo}`, 14, 22)

  const totalGastos = transactions.filter((t) => t.tipo === 'gasto').reduce((s, t) => s + t.valor, 0)
  const totalReceitas = transactions.filter((t) => t.tipo === 'receita').reduce((s, t) => s + t.valor, 0)

  autoTable(doc, {
    startY: 35,
    head: [['Data', 'Descrição', 'Categoria', 'Valor', 'Tipo', 'Pagamento']],
    body: transactions.map((t) => [
      t.data,
      t.descricao,
      t.categoria,
      fmt(t.valor),
      t.tipo,
      t.pagamento,
    ]),
    foot: [
      ['', '', 'Total Receitas', fmt(totalReceitas), '', ''],
      ['', '', 'Total Gastos', fmt(totalGastos), '', ''],
      ['', '', 'Saldo', fmt(totalReceitas - totalGastos), '', ''],
    ],
    headStyles: { fillColor: [30, 30, 46], textColor: [148, 163, 184], fontSize: 9 },
    bodyStyles: { textColor: [226, 232, 240], fontSize: 8, fillColor: [15, 15, 23] },
    alternateRowStyles: { fillColor: [20, 20, 32] },
    footStyles: { fillColor: [30, 30, 46], textColor: [139, 92, 246], fontStyle: 'bold', fontSize: 9 },
    styles: { lineColor: [30, 30, 46], lineWidth: 0.1 },
    margin: { left: 14, right: 14 },
  })

  doc.save(filename)
}
