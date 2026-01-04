// ================= CONFIGURAÇÃO =================
const API_URL = "https://script.google.com/macros/s/AKfycbxKNAKSuyWlzgRwoqJh5VesU-hsRlbH0w5So1q9VPP_rh9JYf0COMK_0PGxua7EOvdLRQ/exec"; // 👈 substitua

let CONFIG = {};
let ESTOQUE = [];

// ================= CARREGAMENTO INICIAL =================
async function carregarSistema() {
  await carregarConfig();
  await carregarEstoque();
  renderEstoque();
  renderFilamentos();
}
function show(id){
  document.querySelectorAll("section").forEach(s =>
    s.classList.add("hidden")
  );
  document.getElementById(id).classList.remove("hidden");
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
  ESTOQUE.forEach(f => {
    ul.innerHTML += `<li>${f.nome} — ${f.saldo.toFixed(1)} g</li>`;
  });
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
  const precoFinal = precoBase + (precoBase * taxaPct) + taxaFixa + CONFIG.embalagem;

  document.getElementById("resultado").innerText =
    `Preço Final: R$ ${precoFinal.toFixed(2)}`;

  return {
    filamento: fil,
    peso,
    horas,
    custo: custoTotal,
    preco: precoFinal,
    marketplace
  };
}

// ================= EXECUÇÃO REAL =================
async function executarProjeto() {
  const modo = document.getElementById("modo").value;
  if (modo !== "real") {
    alert("Modo simulação ativo. Estoque não será alterado.");
    calcularProjeto();
    return;
  }

  const r = calcularProjeto();

  if (r.peso > r.filamento.saldo) {
    alert("Estoque insuficiente!");
    return;
  }

  // baixa estoque
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "baixar",
      id: r.filamento.id,
      peso: r.peso
    })
  });

  // registra projeto
  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "projeto",
      produto: "Projeto Manual",
      filamento: r.filamento.nome,
      peso: r.peso,
      horas: r.horas,
      custo: r.custo,
      preco: r.preco,
      marketplace: r.marketplace
    })
  });

  alert("Projeto registrado e estoque atualizado!");
  await carregarSistema();
}
function showTab(id) {
  document.querySelectorAll("section").forEach(sec => {
    sec.classList.add("hidden");
  });
  document.getElementById(id).classList.remove("hidden");
}
async function addFilamento() {
  const nome = document.getElementById("nomeFil").value;
  const preco = Number(document.getElementById("precoFil").value);
  const saldo = Number(document.getElementById("saldoFil").value);

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

  alert("Filamento cadastrado!");
  await carregarSistema();

}

// ================= INIT =================
document.addEventListener("DOMContentLoaded", carregarSistema);
