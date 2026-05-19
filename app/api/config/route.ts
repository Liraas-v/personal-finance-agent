// app/api/config/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { readConfig, writeConfig } from '@/lib/db'
import type { Config } from '@/types'

export async function GET() {
  return NextResponse.json(readConfig())
}

export async function PATCH(request: NextRequest) {
  const body: Partial<Config> = await request.json()
  const current = readConfig()
  const updated = { ...current, ...body }
  writeConfig(updated)
  return NextResponse.json(updated)
}
