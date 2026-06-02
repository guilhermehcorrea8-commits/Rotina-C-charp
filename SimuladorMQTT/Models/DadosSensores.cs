namespace SimuladorMQTT
{
    public class DadosSensores
    {
        public int Temperatura { get; set; }

        public int Umidade { get; set; }

        public int Vibracao { get; set; }

        public string Status { get; set; } = "";
    }
}