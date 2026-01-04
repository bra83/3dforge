const API_URL = "https://script.google.com/macros/s/AKfycbxwdOL-HazVHY2S0rDCbNpO6GUn5FnD2ZlV7eXaDFxQla_hrNneQEA54pcabF9qTLAp6g/exec";

// ================== UTIL ==================
function $(id) {
  return document.getElementById(id);
}

// ================== EVENTOS ==================
document.addEventListener("DOMContentLoaded", () => {
  $("btnAdd").addEventListener("click", adicionarFilamento);
  $("btnLoad").addEventListener("click", carregarEstoque);
});

// ================== AÇÕES ==================
async function adicionarFilamento() {
  const nome = $("nomeFil").value.trim();
  const preco = Number($("precoFil").value);
  const saldo = Number($("saldoFil").value);

  if (!nome || preco <= 0 || saldo <= 0) {
    alert("Preencha todos os campos corretamente");
    return;
  }

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "add_filamento",
      nome,
      preco,
      saldo
    })
  });

  const json = await res.json();
  console.log("Resposta API:", json);

  if (json.status === "filamento_salvo") {
    alert("Filamento salvo com sucesso!");
    $("nomeFil").value = "";
    $("precoFil").value = "";
    $("saldoFil").value = "";
    carregarEstoque();
  } else {
    alert("Erro: " + JSON.stringify(json));
  }
}

async function carregarEstoque() {
  const res = await fetch(API_URL + "?action=estoque");
  const data = await res.json();

  const ul = $("listaEstoque");
  ul.innerHTML = "";

  data.forEach(row => {
    const li = document.createElement("li");
    li.textContent = `${row[1]} — ${row[3]} g`;
    ul.appendChild(li);
  });
}

