const API_URL = "https://script.google.com/macros/s/AKfycbxwdOL-HazVHY2S0rDCbNpO6GUn5FnD2ZlV7eXaDFxQla_hrNneQEA54pcabF9qTLAp6g/exec";

// atalho para pegar elementos
const $ = id => document.getElementById(id);

// eventos
document.addEventListener("DOMContentLoaded", () => {
  $("btnAdd").addEventListener("click", adicionarFilamento);
  $("btnLoad").addEventListener("click", carregarEstoque);
  carregarEstoque();
});

// adicionar filamento
async function adicionarFilamento() {
  const nome = $("nomeFil").value.trim();
  const preco = Number($("precoFil").value);
  const saldo = Number($("saldoFil").value);

  if (!nome || preco <= 0 || saldo <= 0) {
    alert("Preencha todos os campos corretamente");
    return;
  }

  const resposta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome,
      preco,
      saldo
    })
  });

  const json = await resposta.json();
  console.log("API:", json);

  alert("Filamento enviado ao servidor");

  $("nomeFil").value = "";
  $("precoFil").value = "";
  $("saldoFil").value = "";

  carregarEstoque();
}

// carregar estoque
async function carregarEstoque() {
  const resposta = await fetch(API_URL);
  const dados = await resposta.json();

  const ul = $("listaEstoque");
  ul.innerHTML = "";

  dados.forEach(row => {
    const li = document.createElement("li");
    li.textContent = `${row[1]} — ${row[3]} g`;
    ul.appendChild(li);
  });
}
