# Agendamento de exames

Aplicação full-stack para consultar exames e horários médicos e realizar agendamentos sem sobreposição. O repositório reúne uma API REST em NestJS e uma interface React.

## Stack

- **API:** Node.js, TypeScript, NestJS, PostgreSQL e Drizzle ORM
- **Frontend:** React, TypeScript, Vite, TanStack Query e Tailwind CSS
- **Testes:** Jest, Supertest e Testcontainers
- **Infraestrutura local:** Docker Compose e Nginx

Links rápidos:

- [Decisões de implementação e premissas](./DECISIONS.md)
- [Coleção de requisições do Postman](./postman_collection.json)
- [Exemplos de requisições curl](./curl-requests.sh)

## Execução rápida com Docker

### Pré-requisitos

- Docker com Docker Compose

### Iniciar

Na raiz do projeto:

```bash
cp api/.env.example api/.env
cp frontend/.env.example frontend/.env
docker compose up --build
```

O Compose cria o banco, executa as migrations e o seed e então inicia:

- Frontend: http://localhost:5173
- API: http://localhost:3000
- PostgreSQL: `localhost:5432`

Para encerrar:

```bash
docker compose down
```

Use `docker compose down -v` somente se também quiser apagar os dados persistidos do PostgreSQL.

## Execução manual

### Pré-requisitos

- Node.js 24 e npm
- PostgreSQL 18 local ou Docker com Docker Compose
- Ao usar PostgreSQL local, um banco vazio chamado `exam_scheduler` (ou outro banco refletido em `DATABASE_URL`)

Crie os arquivos de ambiente:

```bash
cp api/.env.example api/.env
cp frontend/.env.example frontend/.env
```

Para usar somente o PostgreSQL do Compose e executar API e frontend fora de containers:

```bash
docker compose up -d postgres
```

Esse comando expõe o banco em `localhost:5432`, de acordo com a `DATABASE_URL` do arquivo de exemplo. Se preferir uma instalação local do PostgreSQL, crie o banco `exam_scheduler`, mantenha o serviço ativo e ajuste as credenciais em `api/.env`.

Instale as dependências de cada aplicação:

```bash
cd api && npm ci
cd ../frontend && npm ci
cd ..
```

Com o PostgreSQL em execução, prepare e inicie a API:

```bash
cd api
npx drizzle-kit migrate
npm run db:seed
npm run start:dev
```

Em outro terminal, inicie o frontend:

```bash
cd frontend
npm run dev
```

Nesse modo, apenas o banco permanece no Docker; migrations, seed, API e frontend são executados pelos comandos locais acima. Para parar o banco, use `docker compose stop postgres`.

Scripts úteis da API:

- `npm run start`: inicia a API sem watch.
- `npm run start:dev`: inicia a API com watch.
- `npx drizzle-kit migrate`: aplica as migrations pendentes.
- `npm run db:seed`: insere exames, médicos e turnos; pode ser executado novamente com segurança.

## Variáveis de ambiente

Na configuração padrão, não é necessário alterar os valores. Basta copiar os arquivos `.env.example` conforme indicado no setup.

### API (`api/.env`)

| Variável            | Finalidade                                          | Exemplo                                                        |
| ------------------- | --------------------------------------------------- | -------------------------------------------------------------- |
| `POSTGRES_USER`     | Usuário usado pelo PostgreSQL no Docker             | `postgres`                                                     |
| `POSTGRES_PASSWORD` | Senha usada pelo PostgreSQL no Docker               | `postgres`                                                     |
| `POSTGRES_DB`       | Nome do banco criado no Docker                      | `exam_scheduler`                                               |
| `DATABASE_URL`      | String de conexão usada pela API, migrations e seed | `postgresql://postgres:postgres@localhost:5432/exam_scheduler` |
| `TZ`                | Fuso local da clínica e do processo da API          | `America/Sao_Paulo`                                            |
| `PORT`              | Porta da API; opcional, padrão `3000`               | `3000`                                                         |

Ao executar fora do Docker, o host de `DATABASE_URL` é normalmente `localhost`. Dentro da rede do Compose ele é sobrescrito para `postgres`.
No Compose, a API e o mapeamento de portas permanecem fixos em `3000`.

### Frontend (`frontend/.env`)

| Variável            | Finalidade                                  | Padrão                  |
| ------------------- | ------------------------------------------- | ----------------------- |
| `VITE_API_BASE_URL` | URL pública da API consumida pelo navegador | `http://localhost:3000` |

Para usar outra URL na execução local, altere `frontend/.env` antes de executar `npm run dev` ou `npm run build`. No Docker, o valor é definido pelo argumento de build em `docker-compose.yml`.

## Testes

Os testes automatizados estão na API. Execute a partir de `api/`:

```bash
# testes unitários
npm run test:unit

# testes de integração
npm run test:int

# toda a suíte
npm test

# cobertura
npm run test:cov
```

Os testes de integração exigem o Docker ativo (apenas o daemon, o serviço docker que roda segundo plano, docker compose não precisa estar rodando). O Testcontainers inicia um PostgreSQL 18 temporário, aplica as migrations e cria um banco isolado para cada worker do Jest. Não é necessário configurar `DATABASE_URL` para essa suíte.

O frontend ainda não possui suíte automatizada; `npm run lint` e `npm run build` verificam lint e compilação.

## Endpoints

Base local: `http://localhost:3000`.

| Método | Rota                                                  | Descrição                                                                            |
| ------ | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `GET`  | `/exams`                                              | Lista exames; aceita `name` para busca parcial sem diferenciar acentos ou maiúsculas |
| `GET`  | `/appointments/availability?examId=1&date=2026-11-10` | Retorna médicos e slots livres para o exame e a data                                 |
| `GET`  | `/appointments`                                       | Lista agendamentos; usada pela tela `/debug`                                         |
| `POST` | `/appointments`                                       | Cria um agendamento                                                                  |

### Fluxo das requisições no Postman

1. Importe a coleção e execute **Listar exames** ou **Buscar exames por nome** para escolher o `examId`.
2. Ajuste as variáveis `examId` e `date` da coleção e execute **Consultar disponibilidade**.
3. Copie da resposta o `id` de um médico e um item de `availableSlots` para as variáveis `doctorId` e `startTime`.
4. Execute **Criar agendamento**. Use **Listar agendamentos** para conferir o resultado.
