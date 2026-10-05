# Contribuindo

Obrigado pelo interesse! Este é um projeto pessoal, mas contribuições são bem-vindas.

## Ambiente

```bash
git clone https://github.com/Liraas-v/personal-finance-agent.git
cd personal-finance-agent
npm install
npm run dev
```

Requer Node 20.9 ou superior. Para a IA local, instale o [Ollama](https://ollama.com). Para o modo demo, veja o README.

## Antes de abrir um PR

```bash
npm run lint
npm run typecheck
npm run test:run
npm run build
```

O CI roda os mesmos comandos, mais os testes E2E. Mudanças de lógica devem vir com teste; mudanças visuais, conferidas nos temas claro e escuro.

## Testes E2E

Os fluxos principais (lançar gasto, parcelar, metas, tema, chat/insights e navegação mobile) rodam no navegador com [Playwright](https://playwright.dev) contra o build de produção em modo demo:

```bash
npm run test:e2e        # builda, sobe o servidor na porta 3200 e roda tudo
npm run test:e2e:ui     # modo interativo, bom para depurar
```

- Sem baixar o Chromium: `PW_CHANNEL=chrome npm run test:e2e` usa o Chrome instalado. Na primeira vez em outra máquina, `npx playwright install chromium`.
- Os testes são determinísticos: o relógio é fixo em 05/10/2026 e as rotas `/api/ai/*` são interceptadas (`e2e/fixtures.ts`). Nenhum teste usa chave real, rede ou Ollama.
- Quando um teste falha, o trace fica em `test-results/`; abra com `npx playwright show-trace <arquivo>`. No CI, o relatório sobe como artefato.
- Fluxo novo de tela entra com um spec em `e2e/`.

## Convenções

- **Commits:** conventional commits com descrição em português (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`), pequenos e focados.
- **Cores:** use os tokens de tema (`bg-card`, `text-foreground`, `text-primary`…). O teste `tests/lib/no-hardcoded-colors.test.ts` bloqueia hex e cores da paleta Tailwind em `src/app/` e `src/components/`.
- **Tipografia:** texto mínimo de 12px; valores monetários em `font-mono tabular-nums`.
- **Dados:** a camada `src/lib/repositories/` isola o modo self-hosted (JSON local) do modo demo (`localStorage`). Não acesse `fs` nem `localStorage` direto nos componentes.
