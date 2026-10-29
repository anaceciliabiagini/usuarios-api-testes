# API de Usuários (mock) — Exercício de Testes

## Como rodar
```bash
npm install
npm start        # http://localhost:3000
npm test         # roda os testes (Jest)
```

## Endpoints
| Método | Rota            | Sucesso | Erros possíveis |
|--------|-----------------|---------|-----------------|
| GET    | /usuarios/:id   | 200     | 400 (ID inválido), 404 |
| POST   | /usuarios       | 201     | 400 (validação), 409 (email duplicado) |
| PUT    | /usuarios/:id   | 200     | 400, 404, 409 |
| DELETE | /usuarios/:id   | 204     | 400, 404 |
| GET    | /relatorios/emails-duplicados | 200 | — (endpoint para teste de carga com JMeter) |

O relatório analisa uma base fixa de 10.000 usuários. No `app.js` há duas versões do algoritmo:
a VERSÃO 1 (lenta, O(n²)) está ativa e a VERSÃO 2 (rápida, com `Set`) está comentada.

Corpo esperado (POST/PUT):
```json
{ "nome": "João Silva", "email": "joao@email.com", "idade": 25 }
```
Regras: `nome` obrigatório (mín. 3 caracteres), `email` válido e único, `idade` opcional (inteiro de 0 a 130).

## Para os testes
O `app.js` exporta:
- `app` — usar com **supertest** sem subir servidor
- `resetarDados()` — chamar no `beforeEach` para restaurar os 3 usuários iniciais
- `validarUsuario()` e `emailValido()` — funções puras para testes unitários

Exemplo mínimo:
```js
const request = require('supertest');
const { app, resetarDados } = require('../app');

beforeEach(() => resetarDados());

test('busca usuário existente', async () => {
  const res = await request(app).get('/usuarios/1');
  expect(res.status).toBe(200);
  expect(res.body.nome).toBe('Ana Souza');
});
```
# Relatório de Testes de Desempenho e Unitários

## 1. Testes Unitários
Para executar os testes unitários com o Jest e Supertest:
```bash
npm test