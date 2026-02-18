# PolicyForge App

PolicyForge App is a frontend demo for education eligibility evaluation.
Recruiters can select one of ten templates, edit fields, submit a request to the policy engine, and track processing status in real time.
When the request is complete, the UI shows decision result, reasons, computed fields, and download actions for JSON, CSV, and PDF.

The app is built with Next.js App Router, TypeScript, Tailwind, react-hook-form, and zod.
Engine calls are handled by Next.js API proxy routes.
The proxy includes in-memory rate limit and technical error mapping for configuration errors, network failures, timeout, and engine 5xx.

The product runs locally and on Vercel free tier.
Engine endpoint configuration is mandatory through public environment variables.
If configuration is missing, the UI shows a technical banner with clear setup instructions.

## Architecture Overview

```txt
Browser
  |
  v
Next.js App (UI + App Router)
  |\
  | \-- /api/engine/health
  | \-- /api/engine/requests
  |      /api/engine/requests/{id}
  |      /api/engine/requests/{id}/result
  |      /api/engine/requests/{id}/artifacts/{type}
  |
  v
Policy Engine (Cloud Run)
```

## Required Environment Variables

- `NEXT_PUBLIC_ENGINE_URL`
- `NEXT_PUBLIC_ENVIRONMENT` (`dev`, `qa`, `prod`)

Example `.env.local`:

```bash
NEXT_PUBLIC_ENGINE_URL=https://your-cloud-run-service.run.app
NEXT_PUBLIC_ENVIRONMENT=dev
```

## Run

```bash
pnpm install && pnpm dev
```

Example output:

```txt
Next.js dev server started
Ready in ...
```

## Tests and Quality

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

Example output:

```txt
lint: ok
tests: 5 passed
build: success
playwright: 1 passed
```

## Limitations

- Rate limit is in-memory.
- Polling timeout is 60 seconds.
- Artifact download depends on engine availability.

## Next Steps

1. Add authentication and audit trail.
2. Store request history for filtering and replay.
3. Add retries with backoff for transient network errors.

---

# PolicyForge App (Portugues)

O PolicyForge App e uma demo de frontend para avaliacao de elegibilidade em educacao.
O fluxo permite escolher um template, preencher campos, enviar para a engine e acompanhar o status do processamento.
Quando termina, a tela mostra resultado da decisao, motivos, campos calculados e downloads em JSON, CSV e PDF.

A aplicacao foi feita com Next.js App Router, TypeScript, Tailwind, react-hook-form e zod.
As chamadas da engine passam por rotas de proxy no Next.js.
O proxy aplica rate limit simples em memoria e separa erros tecnicos de configuracao, rede, timeout e erro 5xx da engine.

Funciona localmente e na Vercel free.
As variaveis de ambiente publicas sao obrigatorias.
Se faltar configuracao, a interface mostra aviso tecnico com instrucao direta.

## Variaveis de ambiente obrigatorias

- `NEXT_PUBLIC_ENGINE_URL`
- `NEXT_PUBLIC_ENVIRONMENT` (`dev`, `qa`, `prod`)

Exemplo `.env.local`:

```bash
NEXT_PUBLIC_ENGINE_URL=https://your-cloud-run-service.run.app
NEXT_PUBLIC_ENVIRONMENT=dev
```

## Como rodar

```bash
pnpm install && pnpm dev
```

## Como rodar qualidade e testes

```bash
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

## Limites atuais

- Rate limit em memoria.
- Timeout de polling em 60 segundos.
- Download depende da disponibilidade da engine.

## Proximos passos

1. Adicionar autenticacao e trilha de auditoria.
2. Guardar historico de requisicoes.
3. Melhorar retry para falhas temporarias de rede.
