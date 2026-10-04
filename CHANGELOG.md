# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

### Alterado
- Transações listadas da mais recente para a mais antiga; "Últimas transações" do dashboard passa a mostrar as mais recentes.
- Datas em `dd/mm/aaaa`, origem em texto e ações de editar/remover acessíveis por teclado e toque.
- Metas: todas as categorias com a mesma estrutura e ação "Definir limite".
- Gráfico de gastos vs receitas ocupa a altura do card.

### Corrigido
- Meta de economia carregada corretamente ao abrir a tela de metas.
- Hovers sem efeito e contraste dos botões ativos do formulário, do seletor de tema e do trilho das barras de progresso.

## [0.2.0] - 2026-10-04

### Adicionado
- Tema claro e escuro (segue o sistema), com seletor no cabeçalho e em Configurações.
- Tokens semânticos de cor e teste de contraste WCAG nos dois temas.
- Teste que bloqueia cores hardcoded em `app/` e `components/`.
- Dashboard com o saldo como número principal.
- Legenda no gráfico de gastos vs receitas; categorias excedentes do gráfico de rosca agrupadas em "Outras".
- CI no GitHub Actions (lint, typecheck, testes e build), Dependabot e template de pull request.
- README em português e inglês, guia de contribuição e este changelog.

### Alterado
- Visual limpo e minimalista: acento azul-acinzentado, fonte Geist, sem gradientes nem brilho.
- Cores dos gráficos passam a vir das variáveis CSS do tema.
- Pacote renomeado para `personal-finance-agent`, com metadados completos.

### Corrigido
- Item em destaque do select e foco do campo do chat visíveis nos dois temas.
- Erro de hidratação em Configurações (status de voz).
- Erros de tipo em `tests/lib/currency.test.ts`.
