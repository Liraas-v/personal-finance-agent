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

O CI roda os mesmos comandos. Mudanças de lógica devem vir com teste; mudanças visuais, conferidas nos temas claro e escuro.

## Convenções

- **Commits:** conventional commits com descrição em português (`feat:`, `fix:`, `test:`, `docs:`, `chore:`, `refactor:`), pequenos e focados.
- **Cores:** use os tokens de tema (`bg-card`, `text-foreground`, `text-primary`…). O teste `tests/lib/no-hardcoded-colors.test.ts` bloqueia hex e cores da paleta Tailwind em `src/app/` e `src/components/`.
- **Tipografia:** texto mínimo de 12px; valores monetários em `font-mono tabular-nums`.
- **Dados:** a camada `src/lib/repositories/` isola o modo self-hosted (JSON local) do modo demo (`localStorage`). Não acesse `fs` nem `localStorage` direto nos componentes.
