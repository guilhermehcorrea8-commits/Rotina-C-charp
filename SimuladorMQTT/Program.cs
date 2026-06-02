using SimuladorMQTT;

var mqtt = new MqttService();
await mqtt.Conectar();

Random random = new Random();

Console.WriteLine("SIMULADOR MQTT");

while (true)
{
    DadosSensores dados = new DadosSensores
    {
        Temperatura = random.Next(20, 45),
        Umidade = random.Next(40, 90),
        Vibracao = random.Next(0, 100),
        Status = mqtt.MaquinaLigada
            ? "LIGADA"
            : "DESLIGADA"
    };

    await mqtt.Publicar(dados);

    Console.Clear();

    Console.WriteLine("==== MQTT ====");
    Console.WriteLine($"Temperatura: {dados.Temperatura}°C");
    Console.WriteLine($"Umidade: {dados.Umidade}%");
    Console.WriteLine($"Vibracao: {dados.Vibracao}");
    Console.WriteLine($"Status: {dados.Status}");

    await Task.Delay(3000);
}