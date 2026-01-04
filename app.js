function calcular() {
const peso = Number(document.getElementById('peso').value);
const tempo = Number(document.getElementById('tempo').value);
const marketplace = document.getElementById('marketplace').value;

const precoPorGrama = 0.12;
const custoMaquinaHora = 2200 / 3000;
const custoOperacionalHora = 1.1;

let taxaPercentual = marketplace === "Shopee" ? 0.14 : 0.16;
let taxaFixa = marketplace === "Shopee" ? 4 : 6;

let custo =
(peso * precoPorGrama) +
(tempo * custoMaquinaHora) +
(tempo * custoOperacionalHora);

let precoBase = custo * 2.5;
let precoFinal = precoBase + (precoBase * taxaPercentual) + taxaFixa;

document.getElementById('resultado').innerText =
"Preço Final: R$ " + precoFinal.toFixed(2);
}
