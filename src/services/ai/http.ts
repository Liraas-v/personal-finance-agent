import { NextResponse } from 'next/server'
import { STATUS_BY_REASON, toAIProviderError } from './errors'

export function aiErrorResponse(e: unknown): NextResponse {
  const err = toAIProviderError(e)
  return NextResponse.json({ error: err.message, reason: err.reason }, { status: STATUS_BY_REASON[err.reason] })
}
