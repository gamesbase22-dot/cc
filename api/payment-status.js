export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { id } = req.query;
    const apiKey = process.env.ASAAS_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'ASAAS_API_KEY not configured' });
    }

    if (!id) {
        return res.status(400).json({ error: 'Payment ID is required' });
    }

    const apiUrl =
        process.env.ASAAS_ENVIRONMENT === 'production'
            ? 'https://api.asaas.com/api/v3'
            : 'https://sandbox.asaas.com/api/v3';
            

    try {
        const response = await fetch(`${apiUrl}/payments/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'access_token': apiKey
            }
        });

        if (!response.ok) {
            const err = await response.text();
            return res.status(response.status).json({
                error: 'Failed to fetch payment from Asaas',
                details: err
            });
        }

        const data = await response.json();

        return res.status(200).json({
            id: data.id,
            status: data.status,
            billingType: data.billingType,
            value: data.value,
            invoiceUrl: data.invoiceUrl,
            confirmedDate: data.confirmedDate,
            clientPaymentDate: data.clientPaymentDate,
            dueDate: data.dueDate
        });

    } catch (error) {
        console.error('ASAAS STATUS ERROR:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}