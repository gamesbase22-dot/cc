export default async function handler(req, res) {
    const { id } = req.query;
    const apiKey = process.env.ASAAS_API_KEY;

    if (!id) {
        return res.status(400).json({ error: 'Payment ID is required' });
    }

    const apiUrl = process.env.ASAAS_ENVIRONMENT === 'sandbox'
        ? 'https://sandbox.asaas.com/api/v3'
        : 'https://api.asaas.com/api/v3';

    try {
        const response = await fetch(`${apiUrl}/payments/${id}`, {
            headers: { 'access_token': apiKey }
        });

        const data = await response.json();

        if (data.errors) {
            return res.status(400).json({ error: data.errors });
        }

        res.status(200).json({
            id: data.id,
            status: data.status,
            confirmedDate: data.confirmedDate,
            clientPaymentDate: data.clientPaymentDate
        });

    } catch (error) {
        console.error('Asaas Status Error:', error);
        res.status(500).json({ error: 'Failed to fetch status' });
    }
}
