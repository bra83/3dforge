// ================= CONFIG =================
const API_URL = window.API_URL;

if (!API_URL) {
  alert("API_URL não definida no index.html");
}

let CONFIG = {};
let ESTOQUE = [];

// ================= INIT =================
document.addEventListener("DOMContentLoaded", iniciar);

async function iniciar() {
  await carregarConfig();
  await carregarEstoque();
  renderFilamentos();
  renderEstoque();
  renderRelatorio();
}

// ================= LOADERS =================
async function carregarConfig() {
  const r = await fetch(`${API_URL}?action=config`);
  const data = await r.json();
  data.forEach(([k, v]) => CONFIG[k] = Number(v));
}

async function carregarEstoque() {
  const r = await fetch(`${API_URL}?action=estoque`);
  const data = await r.json();
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
  ul.innerHTML = "";
  ESTOQUE.forEach((f, i) => {
    ul.innerHTML += `
      <li>
        <strong>${f.nome}</strong> — ${f.saldo} g<br>
        R$ ${f.preco}/g<br>
        <button onclick="editarFilamento(${i})">✏️</button>
        <button onclick="removerFilamento(${i})">🗑️</button>
      </li>
    `;
  });
}

// ================= FILAMENTO =================
async function addFilamento() {
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "add_filamento",
      nome: nomeFil.value,
      preco: Number(precoFil.value),
      saldo: Number(saldoFil.value)
    })
  });
  nomeFil.value = precoFil.value = saldoFil.value = "";
  await iniciar();
}

async function editarFilamento(i) {
  const f = ESTOQUE[i];
  const nome = prompt("Nome", f.nome);
  const preco = Number(prompt("Preço/g", f.preco));
  const saldo = Number(prompt("Saldo g", f.saldo));

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
  await iniciar();
}

async function removerFilamento(i) {
  if (!confirm("Remover filamento?")) return;
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "remover_filamento",
      id: ESTOQUE[i].id
    })
  });
  await iniciar();
}

// ================= CÁLCULO =================
function calcularProjeto() {
  const f = ESTOQUE[filamento.value];
  const peso = Number(peso.value);
  const horas = Number(tempo.value);
  const margem = Number(margem.value) / 100;
  const mk = market.value;

  const custo =
    peso * f.preco +
    horas * (CONFIG.valor_maquina / CONFIG.vida_util_horas) +
    horas * (CONFIG.custo_luz_hora + CONFIG.mao_obra_hora);

  let taxaPct = 0, taxaFix = 0;
  if (mk === "Shopee") {
    taxaPct = CONFIG.taxa_shopee_pct / 100;
    taxaFix = CONFIG.taxa_shopee_fixa;
  } else {
    taxaPct = CONFIG.taxa_ml_classico_pct / 100;
    taxaFix = CONFIG.taxa_ml_classico_fixa;
  }

  const preco = custo * (1 + margem) + (custo * taxaPct) + taxaFix + CONFIG.embalagem;

  resultado.innerText = `Preço Final: R$ ${preco.toFixed(2)}`;

  return { f, peso, horas, custo, preco, mk };
}

// ================= EXECUÇÃO =================
async function executarProjeto() {
  if (modo.value !== "real") {
    calcularProjeto();
    return alert("Simulação realizada");
  }

  const r = calcularProjeto();
  if (r.peso > r.f.saldo) return alert("Estoque insuficiente");

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "baixar",
      id: r.f.id,
      peso: r.peso
    })
  });

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "projeto",
      produto: "Projeto",
      filamento: r.f.nome,
      peso: r.peso,
      horas: r.horas,
      custo: r.custo,
      preco: r.preco,
      marketplace: r.mk
    })
  });

  alert("Projeto registrado");
  await iniciar();
}

// ================= RELATÓRIO (BÁSICO) =================
function renderRelatorio() {
  const ul = document.getElementById("listaRelatorio");
  if (!ul) return;
  ul.innerHTML = "Os projetos estão registrados na planilha (aba Projetos).";
}
