// app/api/transactions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { readTransactions, writeTransactions } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import type { Transaction } from '@/types'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  const tipo = searchParams.get('tipo')
  const categoria = searchParams.get('categoria')

  let transactions = readTransactions()

  if (from) transactions = transactions.filter((t) => t.data >= from)
  if (to) transactions = transactions.filter((t) => t.data <= to)
  if (tipo) transactions = transactions.filter((t) => t.tipo === tipo)
  if (categoria) transactions = transactions.filter((t) => t.categoria === categoria)

  return NextResponse.json(transactions)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const transaction: Transaction = {
    ...body,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  }

  const transactions = readTransactions()
  transactions.unshift(transaction)
  writeTransactions(transactions)

  return NextResponse.json(transaction, { status: 201 })
}

export async function DELETE() {
  writeTransactions([])
  return NextResponse.json({ ok: true })
}
