# API Gerenciadora de Projetos

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Status](https://img.shields.io/badge/status-concluído-brightgreen)

API REST para gerenciar **projetos** e as **equipes** responsáveis por eles. Desenvolvida em TypeScript com Express, executada pelo terminal e com persistência em **localStorage**.

## Sumário

- [Sobre o projeto](#-sobre-o-projeto)
- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Como executar](#-como-executar)
- [Estrutura do projeto](#-estrutura-do-projeto)
- [Entidades](#-entidades)
- [Endpoints](#-endpoints)
- [Regras de negócio](#-regras-de-negócio)
- [Exemplos de uso](#-exemplos-de-uso)
- [Tratamento de erros](#-tratamento-de-erros)
- [Autor](#-autor)

## Sobre o projeto

O objetivo é oferecer um backend que ajude a organizar projetos e as pessoas envolvidas neles. Cada projeto pode ser vinculado a uma equipe, e cada equipe tem um líder e uma lista de membros.

Como o Node.js não possui `localStorage` nativo, o projeto usa o pacote [`node-localstorage`](https://www.npmjs.com/package/node-localstorage), que oferece a mesma API do navegador e grava os dados em arquivos na pasta `data/`. Assim, as informações continuam salvas quando o servidor é reiniciado.

## Funcionalidades

- CRUD completo de projetos e de equipes
- Validação dos campos obrigatórios e dos formatos de dados
- Geração automática e sequencial de ids
- Edição parcial (só os campos enviados são alterados)
- Tratamento de erros com respostas claras (400, 404 e 500)
- Persistência em localStorage

## Tecnologias

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- [node-localstorage](https://www.npmjs.com/package/node-localstorage)
- [tsx](https://github.com/privatenumber/tsx) (execução em desenvolvimento)

## Como executar

**Pré-requisitos:** [Node.js](https://nodejs.org/) 18 ou superior e [Git](https://git-scm.com/).

```bash
# 1. clonar o repositório
git clone https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git

# 2. entrar na pasta
cd SEU_REPOSITORIO

# 3. instalar as dependências
npm install

# 4. iniciar em modo desenvolvimento
npm run dev
```

A API estará disponível em `http://localhost:3000`.

### Scripts disponíveis

| Comando         | Descrição                                      |
|-----------------|------------------------------------------------|
| `npm run dev`   | Executa o servidor em modo desenvolvimento     |
| `npm run build` | Compila o TypeScript para a pasta `dist/`      |
| `npm start`     | Executa a versão compilada                     |

Para usar outra porta, defina a variável de ambiente `PORT`. No PowerShell: `$env:PORT=4000; npm run dev`.

## Estrutura do projeto

```
.
├── src/
│   ├── server.ts     # servidor Express, rotas e tratamento de erros
│   ├── projetos.ts   # rotas e regras de projetos
│   ├── equipes.ts    # rotas e regras de equipes
│   ├── storage.ts    # leitura/gravação no localStorage e geração de ids
│   ├── erros.ts      # erros HTTP padronizados
│   └── types.ts      # tipos das entidades
├── data/             # dados persistidos (gerada automaticamente, ignorada pelo Git)
├── package.json
└── tsconfig.json
```

## Entidades

### Projeto

| Campo       | Tipo           | Observação                                      |
|-------------|----------------|-------------------------------------------------|
| id          | número         | Gerado pelo sistema                             |
| nome        | string         | Obrigatório, não pode ser vazio                 |
| cliente     | string         | Obrigatório, não pode ser vazio                 |
| dataInicio  | string         | Obrigatório, formato `YYYY-MM-DD`               |
| dataEntrega | string         | Obrigatório, formato `YYYY-MM-DD`               |
| status      | string         | `nao iniciado`, `em andamento` ou `concluido`   |
| idEquipe    | número ou null | Opcional, deve ser o id de uma equipe existente |

### Equipe

| Campo   | Tipo            | Observação                      |
|---------|-----------------|---------------------------------|
| id      | número          | Gerado pelo sistema             |
| lider   | string          | Obrigatório, não pode ser vazio |
| membros | array de string | Opcional                        |

## Endpoints

### Projetos

| Método | Rota            | Descrição                              |
|--------|-----------------|----------------------------------------|
| POST   | `/projetos`     | Cria um projeto                        |
| GET    | `/projetos`     | Lista todos os projetos                |
| GET    | `/projetos/:id` | Busca um projeto pelo id               |
| PUT    | `/projetos/:id` | Atualiza um projeto (total ou parcial) |
| DELETE | `/projetos/:id` | Remove um projeto                      |

### Equipes

| Método | Rota           | Descrição                             |
|--------|----------------|---------------------------------------|
| POST   | `/equipes`     | Cria uma equipe                       |
| GET    | `/equipes`     | Lista todas as equipes                |
| GET    | `/equipes/:id` | Busca uma equipe pelo id              |
| PUT    | `/equipes/:id` | Atualiza uma equipe (total ou parcial) |
| DELETE | `/equipes/:id` | Remove uma equipe                     |

## Regras de negócio

- **Status padrão:** todo projeto nasce como `nao iniciado`. O `status` enviado na criação é ignorado e só pode ser alterado depois, via `PUT`.
- **Ids:** são sempre gerados pelo sistema. Um `id` enviado pelo cliente é ignorado e nunca pode ser alterado.
- **Campos obrigatórios:** a ausência de qualquer um deles retorna **400** e o registro não é criado.
- **Entidade inexistente:** buscar, editar ou excluir algo que não existe retorna **404**.
- **Edição parcial:** os campos não enviados mantêm o valor anterior.
- **Datas:** `dataEntrega` não pode ser anterior a `dataInicio`.
- **Equipe no projeto:** o `idEquipe` é opcional, mas, se informado, a equipe precisa existir.
- **Exclusão de equipe:** os projetos que a usavam ficam com `idEquipe: null`.

## Exemplos de uso

### Criar uma equipe

`POST /equipes`

```json
{
  "lider": "Pessoa 1",
  "membros": ["Pessoa 2", "Pessoa 3"]
}
```

Resposta `201 Created`:

```json
{
  "id": 1,
  "lider": "Pessoa 1",
  "membros": ["Pessoa 2", "Pessoa 3"]
}
```

### Criar um projeto

`POST /projetos`

```json
{
  "nome": "Site institucional",
  "cliente": "TESTE",
  "dataInicio": "2026-01-10",
  "dataEntrega": "2026-03-10",
  "idEquipe": 1
}
```

Resposta `201 Created`:

```json
{
  "id": 1,
  "nome": "Site institucional",
  "cliente": "TESTE",
  "dataInicio": "2026-01-10",
  "dataEntrega": "2026-03-10",
  "status": "nao iniciado",
  "idEquipe": 1
}
```

### Atualizar parcialmente

`PUT /projetos/1`

```json
{
  "status": "em andamento"
}
```

### Com curl (Linux / macOS)

```bash
curl -X POST http://localhost:3000/projetos \
  -H 'Content-Type: application/json' \
  -d '{"nome":"Site","cliente":"ACME","dataInicio":"2026-01-10","dataEntrega":"2026-03-10"}'
```

### Com PowerShell (Windows)

```powershell
Invoke-RestMethod -Method POST -Uri http://localhost:3000/equipes `
  -ContentType "application/json" `
  -Body '{"lider":"Ana","membros":["Bia","Caio"]}'
```

## Tratamento de erros

Formato das respostas de erro:

```json
{
  "erro": "Erro de validação",
  "detalhes": [
    "cliente é obrigatório e não pode ser vazio",
    "dataInicio é obrigatória"
  ]
}
```

| Código | Quando acontece                                 |
|--------|-------------------------------------------------|
| 201    | Recurso criado com sucesso                      |
| 200    | Consulta ou atualização realizada com sucesso   |
| 204    | Exclusão realizada com sucesso                  |
| 400    | Dados inválidos, campos ausentes ou JSON malformado |
| 404    | Projeto, equipe ou rota não encontrada          |
| 500    | Erro interno inesperado                         |

## Resetar os dados

Pare o servidor e apague a pasta `data/`. Ela será recriada na próxima execução.

## Autor

**MARCUS EVERTON DE FRANÇA JUNIOR**

[![GitHub](https://img.shields.io/badge/GitHub-SEU__USUARIO-181717?logo=github)](https://github.com/SEU_USUARIO)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-SEU__PERFIL-0A66C2?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/SEU_PERFIL)
