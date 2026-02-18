# PolicyForge App

PolicyForge App is a product demo for recruiter-facing policy evaluation workflows in education.
The user selects one of ten templates, edits fields, submits to an external policy engine, and tracks request status with 1.5s polling.
When evaluation is complete, the UI shows decision, reasons, computed fields, and artifact download actions (JSON, CSV, PDF).

The frontend is built with Next.js App Router, TypeScript, Tailwind, shadcn-style UI components, react-hook-form, and zod validation.
The app does not call the engine directly from the browser.
All engine communication goes through local Next.js API proxy routes with simple in-memory rate limiting and safe error handling.
The proxy never logs full payloads, which helps reduce accidental PII exposure.

The project runs locally and on Vercel free tier.
Engine runtime is external and configurable with `ENGINE_URL` (default: `http://localhost:8000`).
If the engine is offline, the UI shows an explicit banner with setup instructions for local and Vercel environments.

## Architecture Overview

```
Browser
  |
  v
Next.js App (UI + App Router)
  |\
  | \-- /api/engine/requests (proxy + rate limit)
  |      /api/engine/requests/{id}
  |      /api/engine/requests/{id}/result
  |      /api/engine/requests/{id}/artifacts/{type}
  |
  v
External Policy Engine (ENGINE_URL)
```

Key folders:

- `app/(marketing)/page.tsx`: landing page with CTA
- `app/demo/page.tsx`: template selection + dynamic form
- `app/demo/[requestId]/page.tsx`: live status + result
- `app/api/engine/**`: engine proxy routes
- `src/lib/templates.ts`: 10 templates + policy pack suggestions
- `src/lib/engineClient.ts`: typed browser client for proxy routes
- `src/schemas/`: zod schemas
- `src/components/demo/`: TemplatePicker, DynamicForm, StatusPanel, ResultView
- `tests/unit/`: Vitest tests
- `tests/e2e/`: Playwright smoke test

## Run Locally

Environment:

- Node.js 20+
- pnpm 10+

Set engine URL:

```bash
cp .env.example .env.local
```

`.env.local`

```bash
ENGINE_URL=http://localhost:8000
```

One-command path:

```bash
pnpm install && pnpm dev
```

Open `http://localhost:3000`.

Example output snippet:

```txt
▲ Next.js 16.x
- Local: http://localhost:3000
✓ Ready in ...
```

## Run Tests

Unit tests (Vitest):

```bash
pnpm test
```

Smoke test (Playwright):

```bash
pnpm test:e2e
```

Lint and build:

```bash
pnpm lint
pnpm build
```

Example output snippet:

```txt
✓ 5 passed
✓ Lint completed with no warnings
✓ Compiled successfully
```

## CI

GitHub Actions workflows:

- `.github/workflows/ci.yml`: install, lint, unit tests, build
- `.github/workflows/e2e.yml`: Playwright smoke on PR to `qa/master`, nightly, manual dispatch

## Limitations

- Rate limiting is in-memory, so counters reset per process restart.
- Artifact download depends on engine support and availability.
- Polling interval is fixed at 1.5s and not adaptive.

## Next Steps

1. Add authenticated access control and audit trail.
2. Persist request snapshots for historical search and replays.
3. Add retry strategy with jitter and exponential backoff on transient failures.

---

# PolicyForge App (Portugues)

O PolicyForge App e uma demo de produto para fluxo de avaliacao de politicas na area de educacao.
Quem recruta escolhe um template, ajusta os campos, envia o pedido para a engine e acompanha o status em tempo quase real.
Quando termina, a tela mostra decisao, motivos, campos calculados e botoes de download em JSON, CSV e PDF.

A aplicacao usa Next.js com App Router, TypeScript, Tailwind, componentes no padrao shadcn/ui, react-hook-form e zod.
O navegador nao fala direto com a engine.
Toda chamada passa por rotas de proxy no Next.js, com limite simples em memoria e tratamento de erro sem expor dados sensiveis.
Nao existe log de corpo completo no proxy.

Funciona localmente e tambem na Vercel free.
A URL da engine vem da variavel `ENGINE_URL` (padrao `http://localhost:8000`).
Se a engine estiver fora do ar, aparece um aviso "Engine offline" com orientacao de configuracao.

## Visao de Arquitetura

```
Navegador
  |
  v
Next.js (UI + rotas)
  |\
  | \-- /api/engine/requests
  |      /api/engine/requests/{id}
  |      /api/engine/requests/{id}/result
  |      /api/engine/requests/{id}/artifacts/{type}
  |
  v
Engine externa (ENGINE_URL)
```

Estrutura principal:

- `app/(marketing)/page.tsx`: pagina inicial com CTA
- `app/demo/page.tsx`: selecao de template e formulario
- `app/demo/[requestId]/page.tsx`: status e resultado
- `app/api/engine/**`: rotas de proxy
- `src/lib/templates.ts`: 10 templates e packs sugeridos
- `src/lib/engineClient.ts`: cliente tipado
- `src/schemas/`: validacao zod
- `src/components/demo/`: componentes da demo

## Como Rodar

Pre-requisitos:

- Node.js 20+
- pnpm 10+

Arquivo de ambiente:

```bash
cp .env.example .env.local
```

Conteudo:

```bash
ENGINE_URL=http://localhost:8000
```

Comando direto:

```bash
pnpm install && pnpm dev
```

## Como Rodar Testes

```bash
pnpm test
pnpm test:e2e
pnpm lint
pnpm build
```

Saida esperada (resumo):

```txt
tests/unit ... passed
tests/e2e ... passed
build ... success
```

## Limites atuais

- Rate limit em memoria (reinicia junto com processo).
- Downloads dependem da disponibilidade da engine.
- Polling fixo de 1.5s.

## Proximos passos

1. Adicionar controle de acesso.
2. Guardar historico de requisicoes.
3. Melhorar estrategia de retry.
