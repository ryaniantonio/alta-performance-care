---
paths:
  - "src/**/*.test.ts"
  - "src/**/*.test.tsx"
  - "src/test/**"
---

# Testing

> **Atenção — tooling ainda NÃO instalado.** Este repositório **não tem** Vitest
> nem `@testing-library/react` no [`package.json`](../../package.json) (não há
> script `test`, e o `build` é só `vite build`, que **não** roda `tsc` — não há
> gate de tipo no build). Portanto **a primeira tarefa de teste DEVE instalar o
> tooling** antes de escrever qualquer spec. Enquanto isso não acontece, a única
> rede de segurança é `npm run lint` + revisão manual — escrever testes que não
> rodam é pior que não escrever.

## Setup inicial (primeira tarefa de teste — fazer uma vez)

1. Instalar as dev-deps:

   ```bash
   npm i -D vitest @testing-library/react @testing-library/jest-dom \
     @testing-library/user-event jsdom @vitejs/plugin-react
   ```

   (`@vitejs/plugin-react` já está no projeto; reaproveite-o no config.)

2. Adicionar os scripts em [`package.json`](../../package.json):

   ```jsonc
   "scripts": {
     "test": "vitest run",
     "test:watch": "vitest"
   }
   ```

3. Criar `vitest.config.ts` na raiz, reusando o alias `@/*` → `./src/*` via
   `vite-tsconfig-paths` (já é dependência) e ambiente `jsdom`:

   ```ts
   import { defineConfig } from "vitest/config";
   import react from "@vitejs/plugin-react";
   import tsconfigPaths from "vite-tsconfig-paths";

   export default defineConfig({
     plugins: [tsconfigPaths(), react()],
     test: {
       environment: "jsdom",
       globals: true,
       setupFiles: ["./src/test/setup.ts"],
     },
   });
   ```

4. Criar `src/test/setup.ts` com `import "@testing-library/jest-dom";`.

A partir daí, todo PR que toca lógica passa a poder (e dever) acompanhar teste.

## Onde colocar os testes

- **Co-localize:** `*.test.ts` / `*.test.tsx` **ao lado** do arquivo testado
  (`patients.service.ts` → `patients.service.test.ts`). Nada de pasta `__tests__`
  paralela.
- **Helpers/factories compartilhados:** `src/test/**` (ex.: `src/test/setup.ts`,
  `src/test/factories/`). Fixtures de dados clínicos (PatientRow, AppointmentRow)
  vivem em factories, não copiadas em cada spec.

## O que testar PRIMEIRO (ordem de prioridade)

A arquitetura em camadas já existe — teste de dentro para fora, mockando a borda:

| Camada | Arquivo de referência | Por que primeiro |
|--------|-----------------------|------------------|
| **Services** (regra de negócio + auth) | [`src/services/patients.service.ts`](../../src/services/patients.service.ts) | É onde mora a decisão (`create` resolve `user_id` via `getCurrentUserId` e delega ao repo). Mocke o **repository** e o **session** e asserte o contrato. |
| **Funções puras** | [`src/lib/utils.ts`](../../src/lib/utils.ts), [`src/lib/site.ts`](../../src/lib/site.ts) (`qrCodeUrl`, `whatsappLink`) | Determinísticas, sem I/O — teste mais barato e de maior retorno. |
| **Repositories** (data-access) | [`src/infrastructure/repositories/patients.repository.ts`](../../src/infrastructure/repositories/patients.repository.ts) | Mocke o client Supabase ([`src/integrations/supabase/client.ts`](../../src/integrations/supabase/client.ts)) e asserte a query montada e o tratamento de `error`. |

**Não** comece por componentes de UI nem pelo client Supabase real. A fronteira de
segurança de verdade é a **RLS por `user_id`** no Postgres (políticas
`USING (auth.uid() = user_id)` nas migrations) — isso é responsabilidade do banco,
**não** se cobre com unit test no front. Teste a *lógica que o app controla*.

## Mockando a borda (Supabase / session)

Repositories e services importam o client e a sessão por path alias — mocke-os com
`vi.mock`, nunca a rede real:

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/infrastructure/repositories/patients.repository", () => ({
  patientsRepository: { insert: vi.fn(), list: vi.fn() },
}));
vi.mock("@/infrastructure/supabase/session", () => ({
  getCurrentUserId: vi.fn(),
}));

import { patientsService } from "./patients.service";
import { patientsRepository } from "@/infrastructure/repositories/patients.repository";
import { getCurrentUserId } from "@/infrastructure/supabase/session";

describe("patientsService.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("injeta o user_id da sessão antes de inserir", async () => {
    vi.mocked(getCurrentUserId).mockResolvedValue("user-123");
    vi.mocked(patientsRepository.insert).mockResolvedValue({ id: "p1" } as PatientRow);

    await patientsService.create({ full_name: "Maria" });

    expect(patientsRepository.insert).toHaveBeenCalledWith({
      full_name: "Maria",
      user_id: "user-123",
    });
  });
});
```

Para o **repository**, mocke o builder encadeado do Supabase
(`.from().insert().select().single()`) retornando `{ data, error }`, e cubra os
dois ramos: `error` presente (deve `throw`) e `data` presente (deve retornar).

## Princípios F.I.R.S.T. (obrigatórios)

| Letra | Significa | Na prática |
|-------|-----------|------------|
| **F**ast | Rápido | Sem rede, sem Supabase real, sem timers reais (`vi.useFakeTimers`). |
| **I**ndependent | Independente | Sem ordem entre testes; estado isolado em `beforeEach` (`vi.clearAllMocks()`). |
| **R**epeatable | Repetível | Mesmo resultado em qualquer máquina/horário — datas via `date-fns` com instante fixo, nunca `new Date()` "agora" (ver timezone-dates.md). |
| **S**elf-validating | Auto-validável | `expect(...)` decide passou/falhou; nada de inspeção visual ou `console.log`. |
| **T**imely | Oportuno | Escrito junto da mudança, no mesmo PR — não "depois". |

## Regras

1. **Proibido `any` nos testes** (igual ao código de produção). Use os tipos do
   domínio — `PatientRow`, `AppointmentRow`, DTOs de
   [`src/domain/clinical/types.ts`](../../src/domain/clinical/types.ts) — ou
   `Record<string, unknown>` para shapes parciais. `vi.mocked(fn)` preserva a
   tipagem do mock; use-o em vez de castar para `any`.
2. **Extraia lógica testável para função pura.** Se uma decisão vive dentro de um
   `useMemo`/`useEffect` de um hook (ex.: [`src/hooks/clinical/usePatients.ts`](../../src/hooks/clinical/usePatients.ts))
   ou de um componente, **extraia-a** para um helper puro e teste o helper. Lógica
   de negócio nova deve nascer em [`src/services/`](../../src/services) ou em
   `src/lib/*` — camadas puras, mockáveis, fáceis de cobrir — não enterrada na UI.
3. **Cubra os ramos que importam:** caminho feliz, **erro do Supabase**
   (`error` não-nulo → o repo/service deve propagar/`throw`), retorno vazio
   (`data: null` / `[]`), e a borda de auth (sessão ausente).
4. **Datas determinísticas** — use `date-fns` (já é dependência) sobre um instante
   fixo; jamais asserte contra "agora". Detalhes em timezone-dates.md.
5. **Componente só quando agrega.** Com `@testing-library/react`, teste
   **comportamento** (o que o usuário vê/faz: rótulos, estados, interações via
   `user-event`), não detalhe de implementação (classes, ordem de nós). Texto
   visível é pt-BR com acento (ver pt-br-content.md).

## Rodando

```bash
npm test          # roda uma vez (CI / pré-commit)
npm run test:watch # modo watch durante o desenvolvimento
```

Rode `npm test` **antes de cada commit** de mudança em `services`/`repositories`/
`lib`. Lembre que o `build` **não** typecheck — então o teste é parte da rede que
o build não cobre.

## Por que esta regra existe

O projeto centraliza a regra de negócio em **services** e o acesso a dados em
**repositories**, justamente para serem testáveis em isolamento. Sem testes — e
sem gate de tipo no build — uma regressão em `patientsService.create` (ex.: parar
de injetar `user_id`) chega à produção silenciosamente, e a RLS rejeita a operação
**em runtime**, virando um erro opaco para a nutricionista. Cobrir as camadas
puras com unit test barato é o melhor retorno de confiabilidade que este código
permite hoje.

## Relação com outras regras

- component-reuse.md — extrair lógica para helper/serviço puro (testável) anda
  junto de reusar em vez de duplicar.
- data-access.md / supabase-schema.md — services x repositories x RLS: o que se
  cobre com unit test (lógica do app) vs. o que pertence ao banco (políticas).
- timezone-dates.md — datas em teste são determinísticas; mesma disciplina de
  `date-fns` do código de produção.
- refactoring.md / issue-prompts.md — refator não trivial nasce de issue e vem com
  o teste que protege o comportamento que está sendo movido.
