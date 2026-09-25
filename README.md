# Diagnóstico ENEM

Quiz público de diagnóstico para o ENEM com captura de lead, e área interna para o time comercial acompanhar os leads.

- **Deploy:** https://enem-quiz-web.vercel.app (Vercel + Neon Postgres)
- **Admin local:** `/admin` com `admin@assaad.dev` / `Assaad@2026` (criado pelo seed)
- **Admin do deploy:** as credenciais seguem no e-mail de entrega, para não deixar dados de leads abertos a quem ler este repositório público

### Testando o deploy

- Use dados fictícios: é um protótipo, e os leads ficam visíveis no admin.
- Cada e-mail faz o diagnóstico uma vez a cada 24h. Repetindo o e-mail, a tela avisa e o resultado anterior é reenviado para esse endereço (no máximo uma vez por hora).
- Cada IP cria até 20 leads a cada 10 minutos.

## Como rodar localmente

Pré-requisitos: Node 22+, pnpm 9 e Docker.

```bash
cp .env.example .env
docker compose up -d        # Postgres 17 na porta 5433 (banco da app + banco de testes)
pnpm install
pnpm db:migrate             # aplica as migrations
pnpm db:seed                # cria o quiz do anexo e o usuário admin
pnpm db:seed:demo           # opcional: 60 leads fictícios para o dashboard ter dados
pnpm dev                    # http://localhost:3000 (front + API)
pnpm dev:api                # opcional: só a API, standalone em http://localhost:4000/api
```

| Rota             | O que é                                        |
| ---------------- | ---------------------------------------------- |
| `/`              | Landing do quiz                                |
| `/quiz`          | Perguntas, depois o formulário de contato      |
| `/resultado/:id` | Resultado com pontuação, faixa e resumo        |
| `/admin`         | Dashboard (login exigido)                      |
| `/admin/leads`   | Lista, busca, filtro, detalhe e exportação CSV |
| `/api/*`         | API REST                                       |

### Variáveis de ambiente

| Variável                         | Obrigatória   | Descrição                                                                                  |
| -------------------------------- | ------------- | ------------------------------------------------------------------------------------------ |
| `DATABASE_URL`                   | sim           | Conexão Postgres                                                                           |
| `SESSION_SECRET`                 | sim           | Segredo (32+ caracteres) para assinar a sessão do admin e o hash de IP                     |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | só no seed    | Credenciais criadas pelo `pnpm db:seed` (padrão acima)                                     |
| `SUBMISSION_RATE_LIMIT`          | não           | Leads novos por IP a cada 10 min. Padrão 20; o `.env.example` usa 100 para desenvolvimento |
| `TEST_DATABASE_URL`              | só nos testes | Banco isolado para os testes de integração da API                                          |
| `RESEND_API_KEY`                 | não           | Liga o e-mail do diagnóstico. Sem ela, o envio vira um log e o fluxo segue igual           |
| `EMAIL_FROM`                     | não           | Remetente. O padrão `onboarding@resend.dev` só entrega para o dono da conta Resend         |
| `APP_URL`                        | não           | URL pública para os links do e-mail. Padrão: origem da requisição                          |

### Testes

```bash
pnpm test          # unitários + integração da API contra o Postgres do docker (82 testes)
pnpm test:e2e      # Playwright: fluxo completo, do quiz ao admin, em mobile e desktop
pnpm typecheck && pnpm lint
```

## Arquitetura

Monorepo pnpm com três pacotes e fronteiras verificadas pelo ESLint:

```
packages/
  shared/   contrato puro: schemas zod, faixas, cálculo da pontuação, DTOs
  api/      API REST em Hono + Drizzle (Postgres)
    src/modules/<quiz|lead|auth>/{schema,service,routes,serialize}.ts
  web/      Next.js 16 (App Router): quiz público e admin
    src/app/api/[[...route]]/route.ts   ← monta o app Hono em /api
    src/features/<quiz|result|admin>/   ← api.ts, estado e componentes por domínio
```

- **`shared`** é usado pelos dois lados. O mesmo schema zod valida o formulário no navegador e a requisição no servidor, e as mensagens de erro são as mesmas.
- **Cada módulo da API** segue a mesma divisão:
  - `service.ts` é a única porta de acesso ao banco;
  - `routes.ts` só valida, chama o service e serializa;
  - `serialize.ts` define quais campos saem, então nenhuma linha crua do banco vira resposta.
- **Formato de erro único:** `{ error: { code, message, fields? } }`, com status coerentes (400, 401, 404, 409, 422, 429 e 500).
- **`web`** fala com a API só pelo contrato REST. As exceções, liberadas explicitamente no ESLint, são a rota que monta o app Hono, a checagem de sessão das páginas do admin e `lib/server-api.ts`, que deixa Server Components chamarem a API em processo (`app.request`), sem acessar o banco.

### Modelo de dados

```
quizzes 1─n questions 1─n options(weight 0..12)
quizzes 1─n leads(name, email, phone, score, band, ip_hash, result_email_sent_at, created_at)
leads   1─n lead_answers(position, question_text, option_label, weight, question_id?, option_id?)
admin_users(email, password_hash)
```

- **Conteúdo no banco:** título, subtítulo, perguntas e alternativas ficam no banco. Marketing edita os registros e o front reflete a mudança em até 1 minuto, sem redeploy: a landing é regenerada a cada 60 s (ISR) e o quiz busca o conteúdo na API (cache de CDN de 60 s).
- **Snapshot das respostas:** `lead_answers` guarda o texto da pergunta, a alternativa e o peso no momento do envio. Assim, editar ou apagar conteúdo não altera o histórico dos leads.
- **Faixa persistida:** a faixa fica salva no lead, o que deixa o filtro indexado e congela o diagnóstico que o aluno viu.
- **Garantias no banco:** check constraints para `weight` e `score`, e índices para listagem, filtro por faixa, deduplicação por e-mail, rate limit por IP e busca por trecho de nome ou e-mail (trigramas, `pg_trgm`).

### API

| Método | Rota                                        | Auth           | Respostas                                             |
| ------ | ------------------------------------------- | -------------- | ----------------------------------------------------- |
| GET    | `/api/quizzes/:slug`                        | pública        | 200 (sem os pesos), 404                               |
| POST   | `/api/quizzes/:slug/submissions`            | pública        | 201, 400, 404, 409 (e-mail repetido em 24h), 422, 429 |
| GET    | `/api/results/:id`                          | pública (UUID) | 200, 404                                              |
| POST   | `/api/auth/login`                           | pública        | 200, 400, 401                                         |
| POST   | `/api/auth/logout`                          |                | 204                                                   |
| GET    | `/api/auth/me`                              | admin          | 200, 401                                              |
| GET    | `/api/admin/leads?q=&band=&page=&pageSize=` | admin          | 200, 400, 401                                         |
| GET    | `/api/admin/leads/:id`                      | admin          | 200, 404, 401                                         |
| GET    | `/api/admin/leads/export.csv?q=&band=`      | admin          | 200 (text/csv), 401                                   |
| GET    | `/api/admin/stats`                          | admin          | 200, 401                                              |

## Decisões técnicas

- **Next hospedando uma API Hono separada em camada.** O teste pede API separada do frontend. A API é um pacote próprio, com roteamento, middlewares e erros centralizados, testado com `app.request()` sem subir o Next. O Next só a monta num route handler, o que dá um deploy só, mesma origem, sem CORS e com cookie de sessão simples. A mesma API também sobe sozinha com `pnpm dev:api` (Node, porta 4000), sem nada do Next; para deployá-la como serviço independente (container, Lambda), basta usar esse entrypoint.
- **Next pelo primeiro acesso no celular.** A landing chega pronta em HTML (ISR, regenerada a cada minuto com o conteúdo da API), o que importa num canal de aquisição com tráfego majoritariamente mobile. Quiz e admin são interativos e rodam no navegador. Nenhuma regra de negócio mora no Next.
- **Pontuação só no servidor.** O cliente envia apenas os ids das alternativas, e os pesos nem chegam ao navegador. O servidor confere se todas as perguntas foram respondidas e se cada alternativa pertence à pergunta (422 quando não), soma os pesos e aplica o limite de 0 a 100.
- **Proteção contra abuso:**
  - deduplicação por e-mail em 24h (409), sem condição de corrida graças a um advisory lock do Postgres na transação, com teste de dois envios simultâneos. Para o aluno não ficar sem saída, o resultado anterior é reenviado para o e-mail, e nunca devolvido na resposta, já que qualquer um pode digitar qualquer e-mail. O reenvio é limitado a uma vez por hora por lead;
  - rate limit por IP (429), guardado como hash e não como IP. O limite de 20 leads a cada 10 minutos barra scripts sem bloquear uma escola ou empresa atrás do mesmo IP;
  - honeypot contra bots;
  - no front, o botão fica bloqueado durante o envio.
- **Resultado por UUID.** A tela de resultado pode ser recarregada ou compartilhada e não expõe dados de contato, só o primeiro nome.
- **Autenticação própria e sem dependências externas:**
  - senha com `scrypt` nativo do Node;
  - login com tempo constante, para não revelar se o e-mail existe;
  - sessão em JWT HS256 num cookie httpOnly com SameSite=Lax e duração de 8h;
  - o middleware `requireAdmin` protege todas as rotas `/api/admin/*`, e as páginas do admin também checam a sessão no servidor para redirecionar ao login.
- **CSV pensado para o time comercial:** separador `;` e BOM, para abrir direto no Excel em pt-BR, e proteção contra fórmulas maliciosas em células.
- **UX:**
  - avanço automático ao escolher uma alternativa, botão voltar e progresso preservado ao recarregar a página;
  - o que foi digitado no contato continua lá quando o aluno volta para revisar uma resposta;
  - máscara de telefone (aceita colar com +55) e erros de validação ao lado de cada campo, inclusive as mensagens padrão do zod, em português;
  - estados de carregando, vazio e erro em todas as telas;
  - filtros do admin guardados na URL, então dá para compartilhar ou recarregar a lista filtrada;
  - tabela no desktop e cards no celular.
- **E-mail com o diagnóstico (Resend).** Depois do envio, o lead recebe a pontuação, a faixa, as respostas e o link do resultado. O e-mail sai depois da resposta HTTP: a API pede ao host para manter a função viva (`waitUntil`), e o Next fornece isso com `after()`. Assim o aluno não espera o e-mail, e uma falha de entrega nunca derruba o envio. O template é HTML em tabela com estilos inline, que renderiza igual no Gmail, no Outlook e no celular, e escapa o conteúdo digitado pelo usuário.
- **Integração opcional.** O Resend só liga com chave configurada. Sem chave, o envio vira um log e quem avaliar roda tudo local sem criar conta em nenhum serviço.
- **Identidade da Plataforma Assaad:** logo (SVG vetorial) e favicon vêm do site oficial, para o protótipo já parecer produto da casa. Como a página captura dados pessoais, todas as telas públicas e o login exibem o aviso "Protótipo desenvolvido para o processo seletivo da Assaad Educação. Não é um canal oficial", e o site inteiro sai do Google com `noindex` e `robots.txt`.
- **Design:** tokens semânticos (tinta, superfícies, marca e uma cor por faixa) em Tailwind v4, títulos com serifa editorial e primitivos no estilo shadcn/ui.

## O que ficou de fora e o que eu faria com mais tempo

- **Edição do conteúdo pelo admin.** Hoje o marketing muda o conteúdo direto no banco. Faltam telas de CRUD com versionamento do quiz, publicando uma versão nova em vez de editar a ativa.
- **Rate limit de login** e bloqueio progressivo por tentativas. O rate limit atual cobre só o envio do quiz.
- **Revogação de sessão:** hoje o logout apaga o cookie, mas o JWT segue válido até expirar (8h). Com mais tempo, sessão no banco (ou `jti` com denylist) para revogar na hora.
- **Rate limit num store dedicado** (Upstash ou Redis), com janela deslizante e cobertura de requisições que falham antes de gravar.
- **Paginação por cursor** na lista de leads para volumes grandes, e exportação CSV em streaming.
- **Observabilidade e produto:** Sentry para erros e analytics de funil (PostHog, por exemplo) para ver em qual pergunta o aluno abandona.
- **E-mail:** fila com retry (hoje é uma tentativa só e depois log), domínio próprio verificado, e aviso para o time comercial quando entra um lead da faixa "Reta final".
- **LGPD:** checkbox de consentimento explícito com versão do termo gravada no lead, e rotina de anonimização.
- **Infra como código** com SST, e migrations rodando no pipeline de deploy.
