// app/api/transactions/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { readTransactions, writeTransactions } from '@/lib/db'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const transactions = readTransactions()
  const filtered = transactions.filter((t) => t.id !== id)

  if (filtered.length === transactions.length) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  writeTransactions(filtered)
  return NextResponse.json({ ok: true })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const patch = await request.json()
  const transactions = readTransactions()
  const index = transactions.findIndex((t) => t.id === id)

  if (index === -1) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const updated = { ...transactions[index], ...patch, id }
  transactions[index] = updated
  writeTransactions(transactions)

  return NextResponse.json(updated)
}
