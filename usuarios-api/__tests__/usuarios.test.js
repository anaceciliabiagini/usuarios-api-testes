const request = require('supertest');
const { app, resetarDados } = require('../app');

beforeEach(() => {
  resetarDados();
});

describe('Testes da API de Utilizadores', () => {

  test('Busca (GET /usuarios/:id)', async () => {
    const response = await request(app).get('/usuarios/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('nome', 'Ana Souza');
    expect(response.body).toHaveProperty('email', 'ana@email.com');
  });

  test('Inserção (POST /usuarios)', async () => {
    const novoUsuario = { nome: "João Silva", email: "joao@email.com", idade: 25 };
    const postResponse = await request(app).post('/usuarios').send(novoUsuario);

    expect(postResponse.status).toBe(201);
    expect(postResponse.body).toHaveProperty('id', 4);
    expect(postResponse.body).toMatchObject(novoUsuario);

    const getResponse = await request(app).get('/usuarios/4');
    expect(getResponse.status).toBe(200);
  });

  test('Alteração (PUT /usuarios/:id)', async () => {
    const dadosAtualizados = { nome: "Bruno Lima Silva", email: "bruno.novo@email.com", idade: 31 };
    const putResponse = await request(app).put('/usuarios/2').send(dadosAtualizados);

    expect(putResponse.status).toBe(200);
    expect(putResponse.body).toHaveProperty('id', 2);
    expect(putResponse.body).toMatchObject(dadosAtualizados);
  });

  test('Exclusão (DELETE /usuarios/:id)', async () => {
    const deleteResponse = await request(app).delete('/usuarios/3');
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get('/usuarios/3');
    expect(getResponse.status).toBe(404);
  });

});