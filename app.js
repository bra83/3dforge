// ================= CONFIGURAÇÃO =================
const API_URL = "COLE_AQUI_A_URL_DO_APPS_SCRIPT";

// ================= ESTADO =================
let CONFIG = {};
let ESTOQUE = [];
let RELATORIO = [];

// ================= NAVEGAÇÃO =================
function show(id) {
  document.querySelectorAll("section").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
}

// ================= CARREGAMENTO =================
async function carregarSistema() {
  await carregarConfig();
  await carregarEstoque();
  renderFilamentos();
  renderEstoque();
}

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

// ================= RENDER =================
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
  ESTOQUE.forEach(f => {
    ul.innerHTML += `<li>${f.nome} — ${f.saldo.toFixed(1)} g</li>`;
  });
}

// ================= CADASTRO DE FILAMENTO =================
async function addFilamento() {
  const nome = document.getElementById("nomeFil").value.trim();
  const preco = Number(document.getElementById("precoFil").value);
  const saldo = Number(document.getElementById("saldoFil").value);

  if (!nome || preco <= 0 || saldo <= 0) {
    alert("Preencha corretamente todos os campos.");
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

  document.getElementById("nomeFil").value = "";
  document.getElementById("precoFil").value = "";
  document.getElementById("saldoFil").value = "";

  alert("Filamento cadastrado com sucesso!");
  await carregarSistema();
}

// ================= CÁLCULO =================
function calcularProjeto() {
  const peso = Number(document.getElementById("peso").value);
  const horas = Number(document.getElementById("tempo").value);
  const margem = Number(document.getElementById("margem").value) / 100;
  const marketplace = document.getElementById("marketplace").value;
  const fil = ESTOQUE[document.getElementById("filamento").value];

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
  const precoFinal =
    precoBase +
    precoBase * taxaPct +
    taxaFixa +
    CONFIG.embalagem;

  document.getElementById("resultado").innerText =
    `Preço Final: R$ ${precoFinal.toFixed(2)}`;

  return { fil, peso, horas, custoTotal, precoFinal, marketplace };
}

// ================= EXECUÇÃO REAL =================
async function executarProjeto() {
  const modo = document.getElementById("modo").value;
  const r = calcularProjeto();

  if (modo !== "real") {
    alert("Simulação realizada. Estoque não alterado.");
    return;
  }

  if (r.peso > r.fil.saldo) {
    alert("Estoque insuficiente!");
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

  alert("Projeto executado e estoque atualizado!");
  await carregarSistema();
}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", carregarSistema);
