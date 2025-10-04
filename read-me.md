# Aplicação Node + Typescript + Express + Postgres

## Iniciar aplicação
npm run dev

## Configuração Cors
A origem permitida é restrita a:

- http://localhost:5173 (ambiente de desenvolvimento)

esta origem foi configurada no arquiv .env podendo ser acessada em FRONTEND_URL

## Métodos permitidos
A API aceita os seguintes métodos HTTP:

- GET
- POST
- PUT
- DELETE

## Headers permitidos
Os headers permitidos incluem:

- Content-Type
- Accept

## Utilização do Zod para validação em tempo de execução

## Status esperados 

- 200 - Operação executada com sucesso.
- 201 - Objeto criado com sucesso.
- 204 - Operação executada com sucesso e sem retorno de dados.
- 400 - Erro de validação de dados, payload inválido
- 404 - Produto não encontrado
- 500 - Erro interno de servidor

# Validação de dados com Zod
- O Zod impede dados inválidos por meio de validação declarativa e segura, baseada em esquemas. Ele funciona como um "guardião" que verifica se os dados recebidos têm o formato, tipo e regras definidas no sistema.
