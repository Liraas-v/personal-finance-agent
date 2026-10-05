import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react'

const hook = vi.hoisted(() => ({
  categorias: ['Alimentação', 'Pets', 'Outros'] as string[],
  contagens: { Alimentação: 3, Pets: 2, Outros: 1 } as Record<string, number>,
  adicionar: vi.fn(),
  renomear: vi.fn(),
  remover: vi.fn(),
}))

vi.mock('@/hooks/useCategorias', () => ({
  useCategorias: () => ({
    categorias: hook.categorias,
    contarLancamentos: (n: string) => hook.contagens[n] ?? 0,
    adicionar: hook.adicionar,
    renomear: hook.renomear,
    remover: hook.remover,
  }),
}))

import { CategoriasSection } from '@/components/settings/CategoriasSection'
import { FALLBACK_CHART_COLORS, categoryColor } from '@/lib/chartColors'

beforeEach(() => {
  hook.categorias = ['Alimentação', 'Pets', 'Outros']
  hook.adicionar.mockReset().mockResolvedValue({ ok: true })
  hook.renomear.mockReset().mockResolvedValue({ ok: true })
  hook.remover.mockReset().mockResolvedValue({ ok: true })
})

const linha = (nome: string) => document.querySelector(`li[data-categoria="${nome}"]`) as HTMLElement

describe('CategoriasSection — lista', () => {
  it('mostra cada categoria com a cor da sua posição e a contagem de lançamentos', () => {
    render(<CategoriasSection />)
    expect(linha('Alimentação').querySelector('[data-swatch]')!.getAttribute('data-color')).toBe(
      categoryColor(FALLBACK_CHART_COLORS, 'Alimentação', hook.categorias),
    )
    expect(linha('Pets').querySelector('[data-swatch]')!.getAttribute('data-color')).toBe(FALLBACK_CHART_COLORS.categories[1])
    expect(linha('Pets')).toHaveTextContent('2 lançamentos')
    expect(linha('Outros')).toHaveTextContent('1 lançamento')
  })

  it('"Outros" aparece sem ações, com a cor neutra', () => {
    render(<CategoriasSection />)
    expect(screen.queryByRole('button', { name: 'Renomear Outros' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Remover Outros' })).not.toBeInTheDocument()
    expect(linha('Outros')).toHaveTextContent('padrão do sistema')
    expect(linha('Outros').querySelector('[data-swatch]')!.getAttribute('data-color')).toBe(FALLBACK_CHART_COLORS.neutral)
  })

  it('todos os controles têm nome acessível', () => {
    render(<CategoriasSection />)
    expect(screen.getByRole('textbox', { name: 'Nova categoria' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Renomear Pets' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Remover Pets' })).toBeInTheDocument()
  })
})

describe('CategoriasSection — adicionar', () => {
  it('envia o nome, limpa o campo e não mostra erro', async () => {
    render(<CategoriasSection />)
    const campo = screen.getByRole('textbox', { name: 'Nova categoria' })
    fireEvent.change(campo, { target: { value: 'Viagens' } })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    await waitFor(() => expect(hook.adicionar).toHaveBeenCalledWith('Viagens'))
    await waitFor(() => expect(campo).toHaveValue(''))
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('Enter no campo também adiciona (operável por teclado)', async () => {
    render(<CategoriasSection />)
    const campo = screen.getByRole('textbox', { name: 'Nova categoria' })
    fireEvent.change(campo, { target: { value: 'Viagens' } })
    fireEvent.submit(campo.closest('form')!)
    await waitFor(() => expect(hook.adicionar).toHaveBeenCalledWith('Viagens'))
  })

  it('nome duplicado mostra o motivo em português e mantém o texto digitado', async () => {
    hook.adicionar.mockResolvedValue({ ok: false, motivo: 'duplicada' })
    render(<CategoriasSection />)
    const campo = screen.getByRole('textbox', { name: 'Nova categoria' })
    fireEvent.change(campo, { target: { value: 'pets' } })
    fireEvent.click(screen.getByRole('button', { name: 'Adicionar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe uma categoria com esse nome.')
    expect(campo).toHaveValue('pets')
  })

  it('ao atingir 12 o campo e o botão ficam desabilitados, com explicação', () => {
    hook.categorias = [...Array.from({ length: 12 }, (_, i) => `C${i + 1}`), 'Outros']
    render(<CategoriasSection />)
    expect(screen.getByRole('button', { name: 'Adicionar' })).toBeDisabled()
    expect(screen.getByRole('textbox', { name: 'Nova categoria' })).toBeDisabled()
    expect(screen.getByText(/Limite de 12 categorias atingido/)).toBeInTheDocument()
  })
})

describe('CategoriasSection — renomear', () => {
  it('abre o campo com o nome atual e salva o novo', async () => {
    render(<CategoriasSection />)
    fireEvent.click(screen.getByRole('button', { name: 'Renomear Pets' }))
    const campo = screen.getByRole('textbox', { name: 'Novo nome de Pets' })
    expect(campo).toHaveValue('Pets')
    fireEvent.change(campo, { target: { value: 'Animais' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    await waitFor(() => expect(hook.renomear).toHaveBeenCalledWith('Pets', 'Animais'))
    await waitFor(() => expect(screen.queryByRole('textbox', { name: 'Novo nome de Pets' })).not.toBeInTheDocument())
  })

  it('erro mantém o campo aberto e mostra o motivo; cancelar fecha', async () => {
    hook.renomear.mockResolvedValue({ ok: false, motivo: 'duplicada' })
    render(<CategoriasSection />)
    fireEvent.click(screen.getByRole('button', { name: 'Renomear Pets' }))
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Já existe')
    expect(screen.getByRole('textbox', { name: 'Novo nome de Pets' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(screen.queryByRole('textbox', { name: 'Novo nome de Pets' })).not.toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})

describe('CategoriasSection — remover', () => {
  it('pede o destino, mostra quantos lançamentos serão movidos e remove para "Outros" por padrão', async () => {
    render(<CategoriasSection />)
    fireEvent.click(screen.getByRole('button', { name: 'Remover Pets' }))
    expect(screen.getByText(/2 lançamentos serão movidos para/)).toBeInTheDocument()
    const select = screen.getByRole('combobox', { name: 'Mover lançamentos para' })
    expect(select).toHaveValue('Outros')
    expect(within(select).getAllByRole('option').map((o) => o.textContent)).toEqual(['Alimentação', 'Outros'])

    fireEvent.click(screen.getByRole('button', { name: 'Confirmar remoção' }))
    await waitFor(() => expect(hook.remover).toHaveBeenCalledWith('Pets', 'Outros'))
  })

  it('permite escolher outra categoria como destino', async () => {
    render(<CategoriasSection />)
    fireEvent.click(screen.getByRole('button', { name: 'Remover Pets' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Mover lançamentos para' }), { target: { value: 'Alimentação' } })
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar remoção' }))
    await waitFor(() => expect(hook.remover).toHaveBeenCalledWith('Pets', 'Alimentação'))
  })

  it('cancelar não remove', () => {
    render(<CategoriasSection />)
    fireEvent.click(screen.getByRole('button', { name: 'Remover Pets' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }))
    expect(hook.remover).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: 'Confirmar remoção' })).not.toBeInTheDocument()
  })

  it('categoria sem lançamentos não pede destino', () => {
    hook.contagens = { ...hook.contagens, Pets: 0 }
    render(<CategoriasSection />)
    fireEvent.click(screen.getByRole('button', { name: 'Remover Pets' }))
    expect(screen.getByText(/Nenhum lançamento será movido/)).toBeInTheDocument()
    expect(screen.queryByRole('combobox')).not.toBeInTheDocument()
    hook.contagens = { ...hook.contagens, Pets: 2 }
  })
})
