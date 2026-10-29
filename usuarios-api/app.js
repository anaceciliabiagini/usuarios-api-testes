const express = require('express');

const app = express();
app.use(express.json());

// ---------------- Dados mockados (em memória) ----------------
const usuariosIniciais = [
  { id: 1, nome: 'Ana Souza', email: 'ana@email.com', idade: 22 },
  { id: 2, nome: 'Bruno Lima', email: 'bruno@email.com', idade: 30 },
  { id: 3, nome: 'Carla Mendes', email: 'carla@email.com', idade: 27 },
];

let usuarios = [];
let proximoId = 1;

function resetarDados() {
  usuarios = usuariosIniciais.map((u) => ({ ...u }));
  proximoId = usuarios.length + 1;
}
resetarDados();

// ---------------- Funções auxiliares ----------------
function emailValido(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarUsuario({ nome, email, idade }) {
  const erros = [];
  if (!nome || typeof nome !== 'string' || nome.trim().length < 3) {
    erros.push('Nome é obrigatório e deve ter pelo menos 3 caracteres');
  }
  if (!emailValido(email)) {
    erros.push('Email inválido');
  }
  if (idade !== undefined && (!Number.isInteger(idade) || idade < 0 || idade > 130)) {
    erros.push('Idade deve ser um número inteiro entre 0 e 130');
  }
  return erros;
}

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ erro: 'ID inválido' });
    return null;
  }
  return id;
}

// ---------------- Endpoints ----------------

// Busca: GET /usuarios/:id
app.get('/usuarios/:id', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });

  return res.status(200).json(usuario);
});

// Inserção: POST /usuarios
app.post('/usuarios', (req, res) => {
  const { nome, email, idade } = req.body || {};

  const erros = validarUsuario({ nome, email, idade });
  if (erros.length > 0) return res.status(400).json({ erros });

  if (usuarios.some((u) => u.email === email)) {
    return res.status(409).json({ erro: 'Email já cadastrado' });
  }

  const novo = { id: proximoId++, nome: nome.trim(), email, idade };
  usuarios.push(novo);
  return res.status(201).json(novo);
});

// Alteração: PUT /usuarios/:id
app.put('/usuarios/:id', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const indice = usuarios.findIndex((u) => u.id === id);
  if (indice === -1) return res.status(404).json({ erro: 'Usuário não encontrado' });

  const { nome, email, idade } = req.body || {};
  const erros = validarUsuario({ nome, email, idade });
  if (erros.length > 0) return res.status(400).json({ erros });

  if (usuarios.some((u) => u.email === email && u.id !== id)) {
    return res.status(409).json({ erro: 'Email já cadastrado' });
  }

  usuarios[indice] = { id, nome: nome.trim(), email, idade };
  return res.status(200).json(usuarios[indice]);
});

// Exclusão: DELETE /usuarios/:id
app.delete('/usuarios/:id', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const indice = usuarios.findIndex((u) => u.id === id);
  if (indice === -1) return res.status(404).json({ erro: 'Usuário não encontrado' });

  usuarios.splice(indice, 1);
  return res.status(204).send();
});

// ---------------- Endpoint para TESTE DE CARGA ----------------
// Base grande e fixa (10.000 usuários), separada dos dados do CRUD.
// A cada 50 usuários, um repete o email de outro (gerando duplicados).
const TOTAL_BASE_GRANDE = 10000;
const baseGrande = Array.from({ length: TOTAL_BASE_GRANDE }, (_, i) => {
  const n = i % 50 === 49 ? i - 25 : i; // repete o email do usuário i-25
  return { id: i + 1, nome: `Usuário ${i + 1}`, email: `usuario${n}@email.com` };
});

// Relatório: GET /relatorios/emails-duplicados
app.get('/relatorios/emails-duplicados', (req, res) => {
  const inicio = process.hrtime.bigint();

  // ===== VERSÃO 1 – LENTA: laço dentro de laço, O(n²) =====
  // const duplicados = [];
  // for (let i = 0; i < baseGrande.length; i++) {
  //   for (let j = i + 1; j < baseGrande.length; j++) {
  //     if (baseGrande[i].email === baseGrande[j].email && !duplicados.includes(baseGrande[i].email)) {
  //       duplicados.push(baseGrande[i].email);
  //     }
  //   }
  // }

  // ===== VERSÃO 2 – RÁPIDA: Set, O(n) =====
  const vistos = new Set();
  const duplicadosSet = new Set();

  for (const usuario of baseGrande) {
    if (vistos.has(usuario.email)) {
      duplicadosSet.add(usuario.email);
    } else {
      vistos.add(usuario.email);
    }
  }
  const duplicados = Array.from(duplicadosSet);

  const tempoMs = Number(process.hrtime.bigint() - inicio) / 1e6;
  const lista = [...duplicados].sort();
  return res.status(200).json({
    totalAnalisado: baseGrande.length,
    totalDuplicados: lista.length,
    tempoProcessamentoMs: Number(tempoMs.toFixed(2)),
    duplicados: lista,
  });
});

// ---------------- Inicialização ----------------
// Só sobe o servidor se o arquivo for executado diretamente (node app.js).
// Nos testes, basta importar o app sem abrir porta.
if (require.main === module) {
  const PORTA = process.env.PORT || 3000;
  app.listen(PORTA, () => console.log(`API rodando em http://localhost:${PORTA}`));
}

module.exports = { app, resetarDados, validarUsuario, emailValido };
