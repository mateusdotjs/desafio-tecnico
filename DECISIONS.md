# Decisões de implementação

Este documento registra as principais decisões e premissas adotadas durante o desenvolvimento.

## Funcionamento da aplicação

### Filtro local dos 30 exames no frontend

O frontend carrega o catálogo completo uma vez e filtra os 30 exames em memória conforme o usuário digita. Para um conjunto pequeno e estático, isso deixa a busca imediata, evita uma requisição a cada alteração do campo e aproveita o cache do TanStack Query.

A API ainda oferece `GET /exams?name=...`, preservando a busca no servidor para outros clientes e para uma eventual evolução do catálogo. Se o volume crescer, o frontend pode migrar para essa busca com debounce e paginação.

### Finalidade da rota `/debug`

`/debug` é uma rota do frontend para facilitar a avaliação e a inspeção do desafio. Ela consome `GET /appointments` e exibe os agendamentos persistidos, tornando possível confirmar rapidamente o resultado do fluxo sem consultar diretamente o banco.

Ela não representa uma área administrativa pronta para produção. Nesse cenário, a listagem deveria ser protegida, paginada e limitada conforme o perfil do usuário.

### Constraint de exclusão para concorrência

Impedir dois agendamentos simultâneos para o mesmo médico é uma regra central do desafio. Uma checagem feita apenas pela API não é suficiente: duas requisições podem consultar a disponibilidade ao mesmo tempo, ambas encontrar o horário livre e tentar inseri-lo em seguida. Mesmo uma transação comum não elimina essa corrida, pois não existe ainda uma linha daquele horário para bloquear.

A API mantém uma consulta prévia de conflitos porque ela evita uma tentativa de escrita desnecessária na situação comum e permite responder com uma mensagem de domínio clara. A garantia definitiva, porém, fica no PostgreSQL, que é o único ponto compartilhado por todas as requisições e por eventuais múltiplas instâncias da API.

A tabela `appointments` possui uma exclusion constraint GiST que combina igualdade de `doctor_id` com sobreposição do intervalo `tstzrange(start_at, end_at, '[)')`. A extensão `btree_gist` permite usar a igualdade do médico no mesmo índice. Dessa forma, a validação ocorre atomicamente durante a escrita: entre inserções concorrentes, uma é aceita e a outra viola a constraint.

A API reconhece o código PostgreSQL `23P01` dessa violação e o converte em um erro de domínio com status HTTP `409 Conflict`. Assim, a proteção não depende do timing das consultas nem de uma única instância do servidor.

### Geração dos slots pela duração do exame

Os slots são gerados a partir do início de cada turno, avançando em passos iguais à duração do exame selecionado. Um slot só é incluído se o intervalo completo couber no turno. Depois disso, horários passados e intervalos que colidem com agendamentos existentes são removidos.

Essa abordagem foi escolhida porque a duração faz parte do exame, não da agenda do médico. Uma grade global fixa exigiria combinações ou arredondamentos artificiais e poderia desperdiçar partes do turno. Gerar sob demanda mantém a regra em um único lugar e garante que todo horário oferecido comporte o exame completo.

### Intervalos no formato `[início, fim)`

Agendamentos são tratados como intervalos semiabertos: o início pertence ao intervalo e o fim não. Assim, um exame que termina às 09:00 não conflita com outro que começa às 09:00.

A mesma semântica é usada na regra em memória e no PostgreSQL por meio de `tstzrange(start_at, end_at, '[)')`, evitando divergência entre validação e persistência.

### `America/Sao_Paulo` como fuso da clínica

Datas e horários enviados pela interface representam o horário local da clínica. A API executa com `TZ=America/Sao_Paulo`, converte esses valores em instantes e os persiste em colunas `timestamp with time zone`.

Um fuso explícito evita que o comportamento dependa do fuso da máquina ou do container em que a API estiver rodando. A escolha de São Paulo reflete a localização presumida da clínica e mantém a interface em termos locais (`AAAA-MM-DD` e `HH:mm`), enquanto o banco preserva instantes comparáveis. A premissa atual é uma única clínica; uma aplicação multiunidade deveria armazenar o fuso por unidade e fazer a conversão explicitamente.

## Persistência

### PostgreSQL e Drizzle

O PostgreSQL foi escolhido porque o domínio é relacional e exige mais do que armazenamento: chaves estrangeiras mantêm exames, médicos e agendamentos consistentes, enquanto range types, GiST e exclusion constraints permitem garantir a regra de concorrência no banco. Implementar a mesma garantia apenas na aplicação exigiria locks distribuídos ou um nível de isolamento mais caro e complexo.

O Drizzle foi adotado por manter schema e consultas tipados em TypeScript sem esconder o SQL. Suas migrations aceitam SQL explícito, o que foi importante para usar `btree_gist`, `tstzrange` e a exclusion constraint diretamente. Uma ORM mais abstrata poderia facilitar operações simples, mas acrescentaria pouco neste projeto e dificultaria enxergar justamente a garantia mais importante do modelo.

## Testes

### Testcontainers e bancos isolados

Os testes de integração usam Testcontainers com a mesma versão principal do PostgreSQL adotada pela aplicação. As migrations são aplicadas uma vez a um banco modelo temporário, e cada worker do Jest recebe um banco clonado e exclusivo.

Um mock ou banco em memória não reproduziria extensões, ranges e constraints específicas do PostgreSQL, portanto poderia aprovar um comportamento diferente do usado em produção. O banco isolado por worker permite paralelismo sem vazamento de estado e torna cada teste repetível. O custo aceito é exigir Docker e ter uma inicialização mais lenta que a dos testes unitários.

## Escopo

### Ausência de autenticação

Autenticação e autorização ficaram fora do escopo porque o desafio concentra-se em busca, disponibilidade e concorrência no agendamento. A API e a rota `/debug` são, portanto, abertas no ambiente local.

Adicionar autenticação sem requisitos de identidade ou perfis criaria decisões arbitrárias e desviaria esforço das regras avaliadas. Em produção, seria necessário autenticar pacientes e equipe, restringir a listagem de agendamentos, associar cada agendamento ao usuário e registrar ações sensíveis em trilha de auditoria.
