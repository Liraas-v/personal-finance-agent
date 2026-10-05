'use client'
import { useId, useState } from 'react'
import { Tags } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCategorias, type Resultado } from '@/hooks/useCategorias'
import { useChartColors } from '@/hooks/useChartColors'
import { categoryColor } from '@/lib/chartColors'
import { MAX_CATEGORIAS, MAX_NOME, OUTROS } from '@/lib/customCategories'

const MOTIVOS: Record<string, string> = {
  vazio: 'Informe um nome.',
  longo: `Use no máximo ${MAX_NOME} caracteres.`,
  duplicada: 'Já existe uma categoria com esse nome.',
  reservada: '"Outros" é uma categoria do sistema e não pode ser usada nem alterada.',
  limite: `Você já tem ${MAX_CATEGORIAS} categorias. Remova uma para criar outra.`,
  inexistente: 'Essa categoria não existe mais.',
  destino: 'Escolha para onde mover os lançamentos.',
  falha: 'Não foi possível concluir. Veja o aviso e tente de novo.',
}

const botao = 'rounded-md border border-border-strong px-2 py-1 text-xs text-foreground-secondary transition-colors hover:bg-muted hover:text-foreground'

export function CategoriasSection() {
  const { categorias, contarLancamentos, adicionar, renomear, remover } = useCategorias()
  const colors = useChartColors()
  const uid = useId()

  const [nova, setNova] = useState('')
  const [renomeando, setRenomeando] = useState<string | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [removendo, setRemovendo] = useState<string | null>(null)
  const [destino, setDestino] = useState(OUTROS)
  const [erro, setErro] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState(false)

  const quantasEditaveis = categorias.filter((c) => c !== OUTROS).length
  const noLimite = quantasEditaveis >= MAX_CATEGORIAS

  async function executar(acao: () => Promise<Resultado>, aoConcluir: () => void) {
    setOcupado(true)
    const r = await acao()
    setOcupado(false)
    if (r.ok) {
      setErro(null)
      aoConcluir()
    } else {
      setErro(MOTIVOS[r.motivo] ?? MOTIVOS.falha)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Tags size={16} className="text-primary" />
        <h3 className="font-semibold text-foreground">Categorias</h3>
      </div>

      <ul className="divide-y divide-border">
        {categorias.map((nome) => {
          const qtd = contarLancamentos(nome)
          const cor = categoryColor(colors, nome, categorias)
          const reservada = nome === OUTROS
          return (
            <li key={nome} data-categoria={nome} className="py-2.5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  data-swatch
                  data-color={cor}
                  aria-hidden
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: cor }}
                />
                {renomeando === nome ? (
                  <form
                    className="flex flex-1 items-center gap-2"
                    onSubmit={(e) => {
                      e.preventDefault()
                      executar(() => renomear(nome, novoNome), () => setRenomeando(null))
                    }}
                  >
                    <Input
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      aria-label={`Novo nome de ${nome}`}
                      autoFocus
                      className="h-8 flex-1 border-border-strong bg-muted text-sm text-foreground"
                    />
                    <Button type="submit" size="sm" className="h-8 text-xs" disabled={ocupado}>
                      Salvar
                    </Button>
                    <button type="button" className={botao} onClick={() => { setRenomeando(null); setErro(null) }}>
                      Cancelar
                    </button>
                  </form>
                ) : (
                  <>
                    <span className="min-w-0 flex-1 truncate text-sm text-foreground">{nome}</span>
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {qtd} {qtd === 1 ? 'lançamento' : 'lançamentos'}
                    </span>
                    {reservada ? (
                      <span className="text-xs text-muted-foreground">padrão do sistema</span>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className={botao}
                          aria-label={`Renomear ${nome}`}
                          onClick={() => { setRenomeando(nome); setNovoNome(nome); setRemovendo(null); setErro(null) }}
                        >
                          Renomear
                        </button>
                        <button
                          type="button"
                          className={botao}
                          aria-label={`Remover ${nome}`}
                          onClick={() => { setRemovendo(nome); setDestino(OUTROS); setRenomeando(null); setErro(null) }}
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {removendo === nome && (
                <div className="mt-3 space-y-2 rounded-md border border-border bg-muted p-3">
                  <p className="text-sm text-foreground">
                    {qtd === 0
                      ? `Remover "${nome}"? Nenhum lançamento será movido.`
                      : `Remover "${nome}"? ${qtd} ${qtd === 1 ? 'lançamento será movido' : 'lançamentos serão movidos'} para:`}
                  </p>
                  {qtd > 0 && (
                    <select
                      aria-label="Mover lançamentos para"
                      value={destino}
                      onChange={(e) => setDestino(e.target.value)}
                      className="h-8 w-full rounded-md border border-border-strong bg-card px-2 text-xs text-foreground"
                    >
                      {categorias.filter((c) => c !== nome).map((c) => <option key={c}>{c}</option>)}
                    </select>
                  )}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 text-xs"
                      disabled={ocupado}
                      onClick={() => executar(() => remover(nome, destino), () => setRemovendo(null))}
                    >
                      {ocupado ? 'Removendo...' : 'Confirmar remoção'}
                    </Button>
                    <button type="button" className={botao} onClick={() => { setRemovendo(null); setErro(null) }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          executar(() => adicionar(nova), () => setNova(''))
        }}
      >
        <Input
          value={nova}
          onChange={(e) => { setNova(e.target.value); setErro(null) }}
          aria-label="Nova categoria"
          aria-describedby={`${uid}-ajuda`}
          placeholder="Ex.: Pets, Viagens"
          disabled={noLimite}
          className="h-8 flex-1 border-border-strong bg-muted text-sm text-foreground"
        />
        <Button type="submit" size="sm" className="h-8 text-xs" disabled={noLimite || ocupado}>
          Adicionar
        </Button>
      </form>

      <p id={`${uid}-ajuda`} className="text-xs text-muted-foreground">
        {noLimite
          ? `Limite de ${MAX_CATEGORIAS} categorias atingido: o gráfico só distingue esse tanto de cores.`
          : `Até ${MAX_CATEGORIAS} categorias, além de "Outros". Cada uma tem uma cor própria nos gráficos.`}
      </p>

      {erro && (
        <p role="alert" className="text-xs text-negative">
          {erro}
        </p>
      )}
    </div>
  )
}
