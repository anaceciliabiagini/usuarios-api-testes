const http = require('http');

async function fazerRequisicao() {
  const inicio = Date.now();
  return new Promise((resolve) => {
    http.get('http://localhost:3000/relatorios/emails-duplicados', (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(Date.now() - inicio));
    }).on('error', () => resolve(null));
  });
}

async function rodarTeste() {
  console.log("A iniciar simulação de carga (200 requisições)...");
  const tempos = [];
  const inicioTotal = Date.now();

  for (let i = 0; i < 10; i++) {
    const promessas = Array.from({ length: 20 }, () => fazerRequisicao());
    const resultados = await Promise.all(promessas);
    tempos.push(...resultados.filter(t => t !== null));
  }

  const tempoTotal = (Date.now() - inicioTotal) / 1000;
  tempos.sort((a, b) => a - b);

  const media = tempos.reduce((a, b) => a + b, 0) / tempos.length;
  const p90 = tempos[Math.floor(tempos.length * 0.9)];
  const max = tempos[tempos.length - 1];
  const throughput = (tempos.length / tempoTotal).toFixed(2);

  console.log("\n--- RESULTADOS DO TESTE ---");
  console.log(`Average (ms): ${media.toFixed(2)}`);
  console.log(`90% Line (ms): ${p90}`);
  console.log(`Max (ms): ${max}`);
  console.log(`Throughput (req/s): ${throughput}`);
}

rodarTeste();
