import { useState, useEffect, useCallback } from 'react'

interface OllamaStatus {
  online: boolean
  model: string
  loaded?: boolean
}

export function useOllamaStatus(pollInterval = 30_000) {
  const [status, setStatus] = useState<OllamaStatus>({ online: false, model: '' })
  const [loading, setLoading] = useState(true)

  const check = useCallback(async () => {
    try {
      const res = await fetch('/api/ai/status')
      const data: OllamaStatus = await res.json()
      setStatus(data)
    } catch {
      setStatus({ online: false, model: '' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // check() é um fetch assíncrono de status — buscar dados no mount é justamente o papel do effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    check()
    const id = setInterval(check, pollInterval)
    return () => clearInterval(id)
  }, [check, pollInterval])

  return { status, loading, refresh: check }
}
