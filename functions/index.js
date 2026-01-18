const functions = require("firebase-functions");
const axios = require("axios");
const cors = require("cors")({ origin: true });

const ASAAS_API_URL = "https://www.asaas.com/api/v3";
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

// 🔒 CRIAR PAGAMENTO PIX
exports.createPayment = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).json({ error: "Método não permitido" });
      }

      const { customer, value } = req.body;

      if (!customer || !value) {
        return res.status(400).json({
          error: "customer e value são obrigatórios",
        });
      }

      const payment = await axios.post(
        `${ASAAS_API_URL}/payments`,
        {
          customer,
          billingType: "PIX",
          value,
          dueDate: new Date().toISOString().split("T")[0],
        },
        {
          headers: {
            access_token: ASAAS_API_KEY,
          },
        }
      );

      res.status(200).json(payment.data);
    } catch (err) {
      console.error("ERRO ASAAS:", err.response?.data || err.message);
      res.status(500).json({
        error: err.response?.data || err.message,
      });
    }
  });
});

// 🔔 WEBHOOK ASAAS
exports.webhook = functions.https.onRequest((req, res) => {
  try {
    console.log("WEBHOOK RECEBIDO:", req.body);
    res.status(200).send("OK");
  } catch (err) {
    res.status(500).send("Erro");
  }
});
