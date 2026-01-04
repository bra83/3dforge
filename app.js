// CONFIG FIXA (depois vira configurável)
const MAQUINA_VALOR = 4200;
const VIDA_UTIL = 8000;
const LUZ_POR_HORA = 0.85;
const MAO_OBRA_HORA = 5;

// ESTADO
let estoque = JSON.parse(localStorage.getItem("estoque")) || [];

// UI
function show(id){
  document.querySelectorAll("section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ESTOQUE
function addFilamento(){
  const nome = f_nome.value.trim();
  const preco = Number(f_preco.value);
  const saldo = Number(f_saldo.value);

  if(!nome || preco<=0 || saldo<=0){
    alert("Preencha corretamente");
    return;
  }

  estoque.push({ nome, preco, saldo });
  salvar();
  f_nome.value = f_preco.value = f_saldo.value = "";
}

function salvar(){
  localStorage.setItem("estoque", JSON.stringify(estoque));
  render();
}

function render(){
  listaEstoque.innerHTML = "";
  filamento.innerHTML = "";

  estoque.forEach((f,i)=>{
    listaEstoque.innerHTML += `<li>${f.nome} — ${f.saldo} g</li>`;
    filamento.innerHTML += `<option value="${i}">${f.nome}</option>`;
  });
}

// PROJETO
function calcular(){
  if(estoque.length === 0){
    alert("Cadastre um filamento");
    return;
  }

  const f = estoque[filamento.value];
  const peso = Number(peso.value);
  const horas = Number(horas.value);
  const margem = Number(margem.value)/100;

  const custoMaterial = peso * f.preco;
  const custoMaquina = horas * (MAQUINA_VALOR / VIDA_UTIL);
  const custoOperacional = horas * (LUZ_POR_HORA + MAO_OBRA_HORA);

  const custoTotal = custoMaterial + custoMaquina + custoOperacional;
  const precoFinal = custoTotal * (1 + margem);

  resultado.innerText = `Preço: R$ ${precoFinal.toFixed(2)}`;

  if(modo.value === "real"){
    if(peso > f.saldo){
      alert("Estoque insuficiente");
      return;
    }
    f.saldo -= peso;
    salvar();
  }
}

// INIT
render();
