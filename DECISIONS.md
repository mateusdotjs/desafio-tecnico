# Decisões de implementação

Este documento registra as principais decisões e premissas adotadas durante o desenvolvimento.

## Estrutura e stack

O projeto usa um monorepo com `api/` e `frontend/`. Isso mantém as duas partes separadas, mas permite executar e avaliar toda a aplicação a partir de um único repositório.

O NestJS foi escolhido pela organização em módulos, injeção de dependências e validação de entrada. No frontend, o Vite oferece uma configuração simples e rápida para React com TypeScript. O TanStack Query gerencia as requisições e o estado dos dados da API, enquanto o Tailwind CSS permite estilizar a interface sem adicionar uma biblioteca de componentes.

## Funcionamento da aplicação

A rota `/agendar` contém o fluxo principal da aplicação. Nela, o paciente informa seu nome, escolhe o exame, a data, o médico e um horário disponível antes de confirmar o agendamento.

A rota `/debug` exibe os agendamentos persistidos para facilitar a avaliação do desafio sem consultar diretamente o banco. Ela existe apenas para essa finalidade e não faria parte da interface de uma aplicação real.

## Decisões de desenvolvimento

### Filtro local dos 30 exames no frontend

O frontend busca o catálogo completo e filtra os 30 exames em memória conforme o usuário digita. Para um conjunto pequeno e estático de informações como o disponibilizado para o desafio, isso deixa a busca imediata e evita uma requisição a cada alteração do campo.

A API ainda oferece `GET /exams?name=...`, preservando a busca no servidor para outros clientes e para uma eventual evolução do catálogo. Se o volume crescer, o frontend pode migrar para essa busca com debounce e paginação.

### Constraint de exclusão para concorrência

Impedir dois agendamentos simultâneos para o mesmo médico é uma regra central do desafio. Uma checagem feita apenas pela API não é suficiente: duas requisições podem consultar a disponibilidade ao mesmo tempo, ambas encontrar o horário livre e tentar inseri-lo em seguida. Mesmo uma transação comum não elimina essa corrida, pois não existe ainda uma linha daquele horário para bloquear.

A API mantém uma consulta prévia de conflitos porque ela evita uma tentativa de escrita desnecessária na situação comum e permite responder com uma mensagem de domínio clara. A garantia definitiva, porém, fica no PostgreSQL, que é o único ponto compartilhado por todas as requisições e por eventuais múltiplas instâncias da API.

A tabela `appointments` possui uma exclusion constraint GiST que combina igualdade de `doctor_id` com sobreposição do intervalo `tstzrange(start_at, end_at, '[)')`. A extensão `btree_gist` permite usar a igualdade do médico no mesmo índice. Dessa forma, a validação ocorre atomicamente durante a escrita: entre inserções concorrentes, uma é aceita e a outra viola a constraint.

A API reconhece o código PostgreSQL `23P01` dessa violação e o converte em um erro de domínio com status HTTP `409 Conflict`. Assim, a proteção não depende do timing das consultas nem de uma única instância do servidor.

### Tratamento de erros

A API valida os dados de entrada e retorna mensagens em português. Erros conhecidos usam status HTTP específicos: `400` para dados ou horários inválidos, `404` para exame ou médico inexistente e `409` para conflito de agenda. Erros inesperados retornam uma mensagem genérica com status `500`, sem expor detalhes internos.

O frontend exibe essas mensagens no fluxo e trata estados de carregamento, falha e ausência de dados.

### Geração dos slots pela duração do exame

Os slots são gerados a partir do início de cada turno, avançando em passos iguais à duração do exame selecionado. Um slot só é incluído se o intervalo completo couber no turno. Depois disso, horários passados e intervalos que colidem com agendamentos existentes são removidos.

Essa abordagem foi escolhida porque a duração faz parte do exame, não da agenda do médico. Uma grade global fixa exigiria combinações ou arredondamentos artificiais e poderia desperdiçar partes do turno. Gerar sob demanda mantém a regra em um único lugar e garante que todo horário oferecido comporte o exame completo.

### Intervalos no formato `[início, fim)`

Agendamentos são tratados como intervalos semiabertos: o início pertence ao intervalo e o fim não. Assim, um exame que termina às 09:00 não conflita com outro que começa às 09:00.

A mesma semântica é usada na regra em memória e no PostgreSQL por meio de `tstzrange(start_at, end_at, '[)')`, evitando divergência entre validação e persistência.

### `America/Sao_Paulo` como fuso da clínica

Datas e horários enviados pela interface representam o horário local da clínica. A API executa com `TZ=America/Sao_Paulo`, converte esses valores em instantes e os persiste em colunas `timestamp with time zone`.

Um fuso explícito evita que o comportamento dependa do fuso da máquina ou do container em que a API estiver rodando. A escolha de São Paulo reflete a localização presumida da clínica e mantém a interface em termos locais (`AAAA-MM-DD` e `HH:mm`), enquanto o banco preserva instantes comparáveis.

## Persistência

### PostgreSQL e Drizzle

O PostgreSQL foi escolhido porque o domínio é relacional e exige mais do que armazenamento: chaves estrangeiras mantêm exames, médicos e agendamentos consistentes, enquanto range types, GiST e exclusion constraints permitem garantir a regra de concorrência no banco. Implementar a mesma garantia apenas na aplicação exigiria locks distribuídos ou um nível de isolamento mais caro e complexo.

O Drizzle foi adotado por manter schema e consultas tipados em TypeScript sem esconder o SQL. Suas migrations aceitam SQL explícito, o que foi importante para usar `btree_gist`, `tstzrange` e a exclusion constraint diretamente. Uma ORM mais abstrata poderia facilitar operações simples, mas acrescentaria pouco neste projeto e dificultaria enxergar justamente a garantia mais importante do modelo.

## Testes

### Testcontainers e bancos isolados

Os testes de integração usam Testcontainers com a mesma versão principal do PostgreSQL adotada pela aplicação. As migrations são aplicadas uma vez a um banco modelo temporário, e cada worker do Jest recebe um banco clonado e exclusivo.

Um mock ou banco em memória não reproduziria extensões, ranges e constraints específicas do PostgreSQL, portanto poderia aprovar um comportamento diferente do usado em produção. O banco isolado por worker permite paralelismo sem vazamento de estado e torna cada teste repetível. O custo aceito é exigir Docker e ter uma inicialização mais lenta que a dos testes unitários.

## Escopo

Devido ao tempo reduzido que tive disponível para desenvolver o desafio, ficaram como próximos passos:

- Paginar a listagem de agendamentos conforme o volume de dados crescer.
- Adicionar testes automatizados dos componentes e do fluxo do frontend.
- Adicionar logs estruturados, métricas e auditoria das operações.
