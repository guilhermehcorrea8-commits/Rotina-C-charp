using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Protocol;
using System.Text;

namespace SimuladorMQTT
{
    public class MqttService
    {
        private readonly IMqttClient client;

        public bool MaquinaLigada = true;

        public MqttService()
        {
            var factory =
                new MqttFactory();

            client =
                factory.CreateMqttClient();

            client.ApplicationMessageReceivedAsync += e =>
            {
                string mensagem =
                    Encoding.UTF8.GetString(
                        e.ApplicationMessage.Payload
                    );

                if (mensagem == "ON")
                {
                    MaquinaLigada = true;
                }

                if (mensagem == "OFF")
                {
                    MaquinaLigada = false;
                }

                return Task.CompletedTask;
            };
        }

        public async Task Conectar()
        {
            var options =
                new MqttClientOptionsBuilder()

                .WithTcpServer(
                    "3a2c5e78e4fa4b9488eb0da3307566b1.s1.eu.hivemq.cloud",
                    8883
                )

                .WithCredentials(
                    "MqGuiTT",
                    "2px9p7Q@J7JNYpq"
                )

                .WithTlsOptions(o =>
                {
                    o.UseTls();
                })

                .Build();

            await client.ConnectAsync(
                options
            );

            await client.SubscribeAsync(
                "industria/comando",
                MqttQualityOfServiceLevel.AtMostOnce
            );

            Console.WriteLine(
                "MQTT conectado"
            );
        }

        public async Task Publicar(
            DadosSensores dados
        )
        {
            await PublicarValor(
                "industria/temperatura",
                dados.Temperatura.ToString()
            );

            await PublicarValor(
                "industria/umidade",
                dados.Umidade.ToString()
            );

            await PublicarValor(
                "industria/vibracao",
                dados.Vibracao.ToString()
            );

            await PublicarValor(
                "industria/status",
                dados.Status
            );
        }

        private async Task PublicarValor(
            string topico,
            string valor
        )
        {
            var mensagem =
                new MqttApplicationMessageBuilder()

                .WithTopic(topico)

                .WithPayload(valor)

                .Build();

            await client.PublishAsync(
                mensagem
            );
        }
    }
}