const MENSAGENS: Record<string, string> = {
  missing_key: 'A chave da IA não está configurada neste ambiente.',
  offline: 'Não foi possível alcançar a IA: ela parece estar fora do ar.',
  timeout: 'A IA demorou demais para responder.',
  http: 'O serviço de IA devolveu um erro.',
  invalid_response: 'A IA devolveu uma resposta que não consegui interpretar.',
}

export function messageForReason(reason: string | undefined): string {
  return (reason && MENSAGENS[reason]) || 'A IA não está disponível agora.'
}
