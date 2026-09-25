# AGENTS.md

Guia curto para quem (pessoa ou agente) for mexer neste repositório.

## Camadas

- `packages/shared`: contrato puro. Schemas zod, regras de domínio (faixas, pontuação) e DTOs. Não importa nada de `api` ou `web`.
- `packages/api`: API REST em Hono. Não importa nada de `web`. Cada módulo em `src/modules/<nome>/` tem:
  - `schema.ts`: tabelas Drizzle do módulo
  - `service.ts`: única porta de acesso ao banco do módulo
  - `routes.ts`: fino, valida, chama service, serializa
  - `serialize.ts`: whitelist de campos, nunca devolve linha crua do banco
- `packages/web`: Next.js. Fala com a API apenas via HTTP (`/api/*`). A única exceção é `app/api/[[...route]]/route.ts`, que monta o app Hono.

## Regras

1. Validação sempre com os schemas de `shared`, no cliente e no servidor.
2. Erros da API têm um formato só: `{ error: { code, message, fields? } }`. Handlers retornam `fail(...)`, nunca montam o JSON na mão.
3. Pontuação e faixa são calculadas só no servidor.
4. Código em inglês, textos para o usuário em pt-BR.
5. Toda regra nova vem com teste ao lado do arquivo (`*.test.ts`).
6. Log via `logEvent`, nunca `console.log`.

## Comandos

`pnpm dev`, `pnpm test`, `pnpm typecheck`, `pnpm lint`, `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:seed`, `pnpm test:e2e`.
