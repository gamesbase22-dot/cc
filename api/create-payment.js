import axios from "axios";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { customer, value } = req.body;

    const response = await axios.post(
      "https://www.asaas.com/api/v3/payments",
      {
        customer,
        billingType: "PIX",
        value,
        dueDate: new Date().toISOString().split("T")[0],
      },
      {
        headers: {
          access_token: process.env.ASAAS_API_KEY,
        },
      }
    );

    res.status(200).json(response.data);
  } catch (err) {
    res.status(500).json({
      error: err.response?.data || err.message,
    });
  }
}
