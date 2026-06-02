const client = mqtt.connect(
  "wss://3a2c5e78e4fa4b9488eb0da3307566b1.s1.eu.hivemq.cloud:8884/mqtt",
  {
    username: "MqGuiTT",
    password: "2px9p7Q@J7JNYpq",
  }
);

//======================
// ESTADO LOCAL
//======================

let maquinaLigada = false;

//======================
// GRÁFICOS
//======================

function criarGrafico(id, titulo) {
  return new Chart(document.getElementById(id), {
    type: "line",

    data: {
      labels: [],
      datasets: [
        {
          label: titulo,
          data: [],
          borderWidth: 3,
          tension: 0.3,
        },
      ],
    },

    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
}

const graficoTemp = criarGrafico("graficoTemp", "Temperatura");

const graficoUmidade = criarGrafico("graficoUmidade", "Umidade");

const graficoVibracao = criarGrafico("graficoVibracao", "Vibração");

//======================
// MQTT
//======================

client.on("connect", () => {
  console.log("MQTT conectado");

  client.subscribe("industria/temperatura");
  client.subscribe("industria/umidade");
  client.subscribe("industria/vibracao");
  client.subscribe("industria/status");
});

//======================
// RECEBER MQTT
//======================

client.on("message", (topic, message) => {
  const texto = message.toString();
  const hora = new Date().toLocaleTimeString();

  console.log(topic, texto);

  // TEMPERATURA
  if (topic === "industria/temperatura") {
    const valor = Number(texto);

    document.getElementById("temperatura").innerText = valor + " °C";

    atualizarGrafico(graficoTemp, valor, hora);
  }

  // UMIDADE
  if (topic === "industria/umidade") {
    const valor = Number(texto);

    document.getElementById("umidade").innerText = valor + " %";

    atualizarGrafico(graficoUmidade, valor, hora);
  }

  // VIBRAÇÃO
  if (topic === "industria/vibracao") {
    const valor = Number(texto);

    document.getElementById("vibracao").innerText = valor;

    atualizarGrafico(graficoVibracao, valor, hora);
  }

  // STATUS
  if (topic === "industria/status") {
    document.getElementById("status").innerText = texto;
  }
});

//======================
// ATUALIZAR GRÁFICO
//======================

function atualizarGrafico(grafico, valor, hora) {
  grafico.data.labels.push(hora);

  grafico.data.datasets[0].data.push(valor);

  if (grafico.data.labels.length > 10) {
    grafico.data.labels.shift();

    grafico.data.datasets[0].data.shift();
  }

  grafico.update();
}

//======================
// FUNÇÃO LOCAL
//======================

function atualizarInterface() {
  const status = maquinaLigada ? "LIGADA" : "DESLIGADA";

  document.getElementById("status").innerText = status;

  // PUBLICA STATUS NO HIVEMQ
  client.publish("industria/status", status);

  if (maquinaLigada) {
    const hora = new Date().toLocaleTimeString();

    const temperatura = Math.floor(Math.random() * 20) + 20;

    const umidade = Math.floor(Math.random() * 50) + 40;

    const vibracao = Math.floor(Math.random() * 100);

    // MOSTRAR NO HTML
    document.getElementById("temperatura").innerText = temperatura + " °C";

    document.getElementById("umidade").innerText = umidade + " %";

    document.getElementById("vibracao").innerText = vibracao;

    // GRÁFICOS
    atualizarGrafico(graficoTemp, temperatura, hora);

    atualizarGrafico(graficoUmidade, umidade, hora);

    atualizarGrafico(graficoVibracao, vibracao, hora);

    // PUBLICAR NO HIVEMQ
    client.publish("industria/temperatura", temperatura.toString());

    client.publish("industria/umidade", umidade.toString());

    client.publish("industria/vibracao", vibracao.toString());
  } else {
    document.getElementById("temperatura").innerText = "--";

    document.getElementById("umidade").innerText = "--";

    document.getElementById("vibracao").innerText = "--";

    // ZERA DADOS NO HIVEMQ
    client.publish("industria/temperatura", "0");

    client.publish("industria/umidade", "0");

    client.publish("industria/vibracao", "0");
  }
}

//======================
// BOTÕES
//======================

document.getElementById("ligar").onclick = () => {
  maquinaLigada = true;

  atualizarInterface();

  // envia MQTT se existir broker
  client.publish("industria/comando", "ON");
};

document.getElementById("desligar").onclick = () => {
  maquinaLigada = false;

  atualizarInterface();

  // envia MQTT se existir broker
  client.publish("industria/comando", "OFF");
};

// atualiza valores automaticamente
setInterval(() => {
  if (maquinaLigada) {
    atualizarInterface();
  }
}, 3000);
