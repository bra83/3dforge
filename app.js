// ================= CONFIG =================
const API_URL = "COLE_AQUI_SUA_URL_DO_APPS_SCRIPT";

let CONFIG = {};
let ESTOQUE = [];

// ================= INIT =================
document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {
  await carregarConfig();
  await carregarEstoque();
  renderFilamentos();
  renderEstoque();
}

// ================= LOADERS =================
async function carregarConfig() {
  const res = await fetch(`${API_URL}?action=config`);
  const data = await res.json();
  data.forEach(([k, v]) => CONFIG[k] = Number(v));
}

async function carregarEstoque() {
  const res = await fetch(`${API_URL}?action=estoque`);
  const data = await res.json();
  ESTOQUE = data.map(r => ({
    id: r[0],
    nome: r[1],
    preco: Number(r[2]),
    saldo: Number(r[3])
  }));
}

// ================= UI =================
function renderFilamentos() {
  const sel = document.getElementById("filamento");
  sel.innerHTML = "";
  ESTOQUE.forEach((f, i) => {
    sel.innerHTML += `<option value="${i}">${f.nome} (${f.saldo} g)</option>`;
  });
}

function renderEstoque() {
  const ul = document.getElementById("listaEstoque");
  if (!ul) return;
  ul.innerHTML = "";

  ESTOQUE.forEach((f, i) => {
    ul.innerHTML += `
      <li>
        <strong>${f.nome}</strong> — ${f.saldo.toFixed(1)} g<br>
        R$ ${f.preco.toFixed(2)} / g<br>
        <button onclick="editarFilamento(${i})">✏️ Editar</button>
        <button onclick="removerFilamento(${i})">🗑️ Remover</button>
      </li>
    `;
  });
}

// ================= FILAMENTO =================
async function addFilamento() {
  const nome = nomeFil.value;
  const preco = Number(precoFil.value);
  const saldo = Number(saldoFil.value);

  if (!nome || !preco || !saldo) {
    alert("Preencha todos os campos");
    return;
  }

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "add_filamento",
      nome,
      preco,
      saldo
    })
  });

  nomeFil.value = precoFil.value = saldoFil.value = "";
  await carregarEstoque();
  renderFilamentos();
  renderEstoque();
}

async function editarFilamento(index) {
  const f = ESTOQUE[index];

  const nome = prompt("Nome:", f.nome);
  if (!nome) return;

  const preco = Number(prompt("Preço por g:", f.preco));
  const saldo = Number(prompt("Saldo (g):", f.saldo));

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "editar_filamento",
      id: f.id,
      nome,
      preco,
      saldo
    })
  });

  await carregarEstoque();
  renderFilamentos();
  renderEstoque();
}

async function removerFilamento(index) {
  const f = ESTOQUE[index];
  if (!confirm(`Remover ${f.nome}?`)) return;

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "remover_filamento",
      id: f.id
    })
  });

  await carregarEstoque();
  renderFilamentos();
  renderEstoque();
}

// ================= CÁLCULO =================
function calcularProjeto() {
  const peso = Number(peso.value);
  const horas = Number(tempo.value);
  const margem = Number(margem.value) / 100;
  const marketplace = market.value;
  const fil = ESTOQUE[filamento.value];

  const custoMaterial = peso * fil.preco;
  const custoMaquina = horas * (CONFIG.valor_maquina / CONFIG.vida_util_horas);
  const custoOperacional = horas * (CONFIG.custo_luz_hora + CONFIG.mao_obra_hora);
  const custoTotal = custoMaterial + custoMaquina + custoOperacional;

  let taxaPct = 0, taxaFixa = 0;
  if (marketplace === "Shopee") {
    taxaPct = CONFIG.taxa_shopee_pct / 100;
    taxaFixa = CONFIG.taxa_shopee_fixa;
  } else {
    taxaPct = CONFIG.taxa_ml_classico_pct / 100;
    taxaFixa = CONFIG.taxa_ml_classico_fixa;
  }

  const precoBase = custoTotal * (1 + margem);
  const precoFinal = precoBase + (precoBase * taxaPct) + taxaFixa + CONFIG.embalagem;

  resultado.innerText = `Preço Final: R$ ${precoFinal.toFixed(2)}`;

  return { fil, peso, horas, custoTotal, precoFinal, marketplace };
}

// ================= EXECUÇÃO =================
async function executarProjeto() {
  if (modo.value !== "real") {
    calcularProjeto();
    alert("Simulação realizada (estoque não alterado)");
    return;
  }

  const r = calcularProjeto();
  if (r.peso > r.fil.saldo) {
    alert("Estoque insuficiente");
    return;
  }

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "baixar",
      id: r.fil.id,
      peso: r.peso
    })
  });

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "projeto",
      produto: "Projeto Manual",
      filamento: r.fil.nome,
      peso: r.peso,
      horas: r.horas,
      custo: r.custoTotal,
      preco: r.precoFinal,
      marketplace: r.marketplace
    })
  });

  alert("Projeto registrado com sucesso");
  await iniciar();
}
