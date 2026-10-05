# Changelog

Formato baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/).

## [Unreleased]

### Adicionado
- Compras parceladas: ao escolher "parcelado" o formulário pede o número de parcelas e a data da 1ª, mostra a prévia (ex.: "12x de R$ 375,00") e lança uma parcela por mês ("Nike (3/12)"). O valor informado é o total; o centavo de arredondamento fica na última parcela e dias 29 a 31 caem no último dia dos meses curtos. A voz também parcela ("nike 4500 em 12x").
- Lançamento em lote com um único aviso, que para com segurança se alguma parcela falhar.

### Alterado
- Código-fonte movido para `src/` (`app`, `components`, `hooks`, `lib`, `services`, `types`); a raiz do repositório fica só com configuração, documentação e testes. Screenshots do README passam de `public/` para `docs/`.
- Favicon e ícones do PWA próprios (gráfico em alta em azul-acinzentado, o mesmo traço do logo do cabeçalho), no lugar do ícone padrão do Next.js. Gerados por `npm run icons`; o manifest passa a incluir PNG de 192 e 512 px.
- Falhas da IA deixam de ser engolidas: as rotas `/api/ai/*` devolvem 503, 504 ou 502 com o motivo (`missing_key`, `offline`, `timeout`, `http`, `invalid_response`) e a tela de insights mostra a causa. Sem IA, a análise de despesa (voz e formulário) degrada para a categoria "Outros".

### Corrigido
- Insights vazios e IA indisponível deixam de se confundir: os providers (Groq e Ollama) não devolvem mais lista vazia quando falham.

### Removido
- README em inglês e a pasta `uploads/` (o OCR usa o diretório temporário do sistema).

## [0.2.0] - 2026-10-04

Primeira versão publicada: redesign visual, UX por tela e infraestrutura do repositório.

### Adicionado
- Tema claro e escuro (segue o sistema), com seletor no cabeçalho e em Configurações.
- Tokens semânticos de cor, teste de contraste WCAG nos dois temas e teste que bloqueia cores hardcoded em `src/app/` e `src/components/`.
- Dashboard com o saldo como número principal; legenda no gráfico de gastos vs receitas; gráfico de rosca com uma cor fixa por categoria e legenda com o percentual de cada uma.
- Menu "Mais" na navegação mobile (Insights, OCR, Configurações e tema).
- Sugestões de pergunta no estado vazio do chat.
- CI no GitHub Actions (lint, typecheck, testes e build), Dependabot, templates de PR e de issue.
- README, guia de contribuição e este changelog.

### Alterado
- Visual limpo e minimalista: acento azul-acinzentado, fonte Geist, sem gradientes nem brilho. Cores dos gráficos passam a vir das variáveis CSS do tema.
- Transações listadas da mais recente para a mais antiga; "Últimas transações" do dashboard passa a mostrar as mais recentes.
- Datas em `dd/mm/aaaa`, origem em texto e ações de editar/remover acessíveis por teclado e toque.
- Metas: todas as categorias com a mesma estrutura e ação "Definir limite".
- Chat em coluna única; a resposta por voz vira um botão de ícone no campo de mensagem.
- Insights com mensagens coerentes com os dados e botão "Tentar de novo" quando a IA não responde.
- Gráfico de gastos vs receitas ocupa a altura do card.
- Pacote renomeado para `personal-finance-agent`, com metadados completos.
- Dependências atualizadas: Next 16.3, React 19.3, Recharts 3.10, Radix, Lucide, framer-motion 13, Vitest 5, jsdom 30, jest-dom 7, `@types/node` 22, `actions/checkout` e `actions/setup-node` v7.
- Dependabot ignora o ESLint 10, o `@vitejs/plugin-react` 6.1+ e majors do `@types/node` até o ambiente acompanhar (motivos no `dependabot.yml`).

### Corrigido
- Insights pediam para "adicionar transações" mesmo havendo dados: a geração agora espera as transações carregarem.
- Meta de economia real em Configurações (mostrava 0) e carregada corretamente ao abrir a tela de metas.
- Item em destaque do select e foco do campo do chat visíveis nos dois temas; hovers sem efeito; contraste dos botões ativos, do seletor de tema e das barras de progresso.
- Erro de hidratação em Configurações (status de voz) e erros de tipo em `tests/lib/currency.test.ts`.

### Removido
- Barra lateral "Resumo financeiro" do chat (repetia o dashboard).
- Dependência `@types/uuid` (o `uuid` já traz os tipos).
