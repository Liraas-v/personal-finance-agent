# Personal Finance Agent

[Português](README.md) · **English**

[![CI](https://github.com/Liraas-v/personal-finance-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Liraas-v/personal-finance-agent/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Ollama](https://img.shields.io/badge/Ollama-local_AI-grey?logo=ollama&logoColor=white)](https://ollama.com)
[![Vitest](https://img.shields.io/badge/Vitest-tests-6e9f18?logo=vitest&logoColor=white)](https://vitest.dev)

> A local-first personal finance agent. Log expenses by text, voice or receipt photo; the AI categorizes them, analyzes your spending and answers questions about your finances.

**[→ Live demo](https://finance-agent-blue.vercel.app)**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="public/screenshots/dashboard-dark.png">
  <img src="public/screenshots/dashboard-light.png" alt="Personal Finance Agent dashboard with the period balance front and center">
</picture>

## The problem

Most personal finance tools ask you to send your banking data to a third-party cloud. This project started as the opposite: an agent that runs entirely on your machine (local JSON data, AI through Ollama), with no network calls leaving your computer.

## Architecture decision: self-hosted vs. demo

The real product is **local-first by default**. But evaluating a project by cloning it and installing Ollama is too much friction for a portfolio, so the public demo runs in a different mode, isolated behind a repository layer:

| | Self-hosted (the real product) | Public demo |
|---|---|---|
| Data | JSON on your disk (`data/`) | Browser `localStorage`, isolated per visitor |
| AI | Ollama, 100% local and offline | Groq (hosted open model) |
| How to enable | Default, nothing to configure | `NEXT_PUBLIC_APP_MODE=demo` + `AI_PROVIDER=groq` |

The switch happens behind `TransactionRepository`/`ConfigRepository` interfaces (`lib/repositories/`) and an `AIProvider` (`services/ai/`). The rest of the app does not know which mode it is running in.

## Features

- **Transactions:** add expenses and income by text, voice or receipt photo (OCR); edit, delete, search and filter by period. Categorization is done by the AI, with a keyword fallback.
- **Dashboard:** the period balance front and center, income, expenses and savings-goal progress; an expenses vs. income chart, spending by category and an AI-generated summary.
- **Goals:** a monthly savings goal and per-category limits, with visual alerts above 80% and 100%.
- **Insights and financial chat:** AI analysis of the period and a conversation with optional financial context.
- **OCR and voice:** photo or PDF receipt upload (Tesseract.js) and voice input and output (Web Speech API).
- **Light and dark theme:** follows the system, with a switcher in the header and in Settings.
- **Settings:** Ollama URL and model, currency (BRL/USD/EUR), savings goal and JSON backup.
- **PWA:** installable from the browser (Chrome/Edge).

## Screenshots

![Transactions](public/screenshots/transacoes.png)
![Financial chat](public/screenshots/chat.png)
![Receipt OCR](public/screenshots/ocr.png)

## Stack

| Layer | Technology |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, `next-themes`, Geist font |
| State | Zustand |
| AI | Ollama (self-hosted) / Groq (demo), pluggable architecture |
| OCR | Tesseract.js |
| Voice | Web Speech API |
| Charts | Recharts |
| PDF | jsPDF + jspdf-autotable |
| Data | Local JSON (self-hosted) / `localStorage` (demo), pluggable architecture |
| Tests | Vitest + jsdom + Testing Library |
| CI | GitHub Actions |

## Getting started (self-hosted)

Requires Node 20.9 or newer and [Ollama](https://ollama.com).

```bash
git clone https://github.com/Liraas-v/personal-finance-agent.git
cd personal-finance-agent
npm install

ollama pull tinyllama   # ~600 MB, works on low-RAM machines
ollama serve

npm run dev
```

Open [http://localhost:3000](http://localhost:3000). In `/settings`, set the Ollama model, the currency and your savings goal.

## Running the demo mode locally

```bash
cp .env.example .env.local
# edit .env.local: NEXT_PUBLIC_APP_MODE=demo, AI_PROVIDER=groq, GROQ_API_KEY=your-key
npm run dev
```

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint |
| `npm run typecheck` | Type checking (`tsc --noEmit`) |
| `npm test` / `npm run test:run` | Tests (watch mode / single run) |
| `npm run screenshots` | Captures screenshots of the screens (see `scripts/capture-screenshots.mjs`) |

## Project structure

```
app/            routes (App Router) and API routes
components/     UI components, by area (dashboard, chat, goals…) and ui/
hooks/          data and interaction hooks (transactions, insights, voice, chart theme)
lib/            pure logic, chart tokens and repositories/ (local JSON, API, localStorage)
services/ai/    AIProvider (Ollama and Groq) and prompt building
tests/          unit, component and API tests
scripts/        utilities (screenshot capture)
public/         icon, manifest, service worker and screenshots
```

## Tests and CI

```bash
npm run test:run
```

The suite covers pure functions, repositories, the `AIProvider`, API routes and components. Two tests guard the design: one blocks hardcoded and off-palette colors in `app/` and `components/`, and the other checks the WCAG contrast of both themes by reading the CSS itself. CI runs lint, typecheck, tests and build on every pull request.

## API

| Method | Route | Description |
|--------|------|-----------|
| GET | `/api/transactions` | Lists transactions (filters: `from`, `to`, `tipo`, `categoria`) |
| POST | `/api/transactions` | Adds a transaction |
| PATCH | `/api/transactions/[id]` | Updates a transaction |
| DELETE | `/api/transactions` | Removes all transactions |
| DELETE | `/api/transactions/[id]` | Removes one transaction |
| GET/PATCH | `/api/config` | Reads/updates the configuration |
| GET | `/api/ai/status` | Status of the active AI provider |
| GET | `/api/ai/models` | Models available on the active provider |
| POST | `/api/ai/chat` | Chat with optional financial context |
| POST | `/api/ai/analyze` | Categorizes a transaction with AI |
| POST | `/api/ai/insights` | Generates financial insights |
| POST | `/api/ocr` | Extracts data from an image or PDF |

## Roadmap

- [x] Visual redesign with light and dark themes
- [x] CI and bilingual documentation
- [ ] Per-screen UX rework (goals, transactions, chat, insights, mobile)
- [ ] Custom categories
- [ ] End-to-end tests

## Known limitations

- **Web Speech API:** only works in Chrome/Edge, on `localhost` or HTTPS.
- **Chat:** history does not persist across reloads (by design).
- **Public demo:** data lives only in your browser; clearing `localStorage` resets it to the initial seed.

## Contributing

See the [contributing guide](CONTRIBUTING.md) and the [changelog](CHANGELOG.md).

## License

Distributed under the [MIT](LICENSE) license.
