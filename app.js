const API_URL = "https://script.google.com/macros/s/AKfycbxwdOL-HazVHY2S0rDCbNpO6GUn5FnD2ZlV7eXaDFxQla_hrNneQEA54pcabF9qTLAp6g/exec";

let CONFIG = {};
let ESTOQUE = [];

// ================= INIT =================
document.addEventListener("DOMContentLoaded", carregarSistema);

async function carregarSistema() {
  await carregarConfig();
  await carregarEstoque();
  renderFilamentos();
  renderEstoque();
}

// ================= BACKEND =================
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
  ul.innerHTML = "";
  ESTOQUE.forEach(f => {
    ul.innerHTML += `<li>${f.nome} — ${f.saldo} g</li>`;
  });
}

// ================= CADASTRO FILAMENTO =================
async function addFilamento() {
  const nome = document.getElementById("nomeFil").value.trim();
  const preco = Number(document.getElementById("precoFil").value);
  const saldo = Number(document.getElementById("saldoFil").value);

  if (!nome || preco <= 0 || saldo <= 0) {
    alert("Preencha todos os campos corretamente");
    return;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      action: "add_filamento",
      nome,
      preco,
      saldo
    })
  });

  const retorno = await res.json();

  if (retorno.status !== "filamento_adicionado") {
    alert("Erro ao salvar filamento");
    return;
  }

  document.getElementById("nomeFil").value = "";
  document.getElementById("precoFil").value = "";
  document.getElementById("saldoFil").value = "";

  await carregarSistema();
  alert("Filamento cadastrado com sucesso!");
}
