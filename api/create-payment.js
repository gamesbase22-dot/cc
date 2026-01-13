export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { customer, value, description, billingType, dueDate } = req.body;
    const apiKey = process.env.ASAAS_API_KEY; // Read from environment variable

    if (!apiKey) {
        return res.status(500).json({ error: 'ASAAS_API_KEY not configured' });
    }

    const apiUrl = process.env.ASAAS_ENVIRONMENT === 'sandbox'
        ? 'https://sandbox.asaas.com/api/v3'
        : 'https://api.asaas.com/api/v3';

    try {
        // 1. Create or retrieve customer
        // Ideally you search for existing customer first, but for simplicity here we'll create a new one or assuming it handles dupes gracefully or we just proceed to payment if we had a customer ID.
        // For this simple implementation, we'll just create the payment directly. Asaas allows passing customer details inline or creating customer first.
        // Let's create customer first to be safe properly.

        let customerId;

        // Search for customer by email
        const searchResponse = await fetch(`${apiUrl}/customers?email=${customer.email}`, {
            headers: {
                'access_token': apiKey
            }
        });

        const searchData = await searchResponse.json();

        if (searchData.data && searchData.data.length > 0) {
            customerId = searchData.data[0].id;
        } else {
            // Create new customer
            const createCustResponse = await fetch(`${apiUrl}/customers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'access_token': apiKey
                },
                body: JSON.stringify(customer)
            });
            const newCust = await createCustResponse.json();
            if (newCust.errors) throw new Error(JSON.stringify(newCust.errors));
            customerId = newCust.id;
        }

        // 2. Create Payment
        const paymentResponse = await fetch(`${apiUrl}/payments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'access_token': apiKey
            },
            body: JSON.stringify({
                customer: customerId,
                billingType: billingType || 'PIX',
                value: value,
                dueDate: dueDate || new Date().toISOString().split('T')[0],
                description: description
            })
        });

        const payment = await paymentResponse.json();

        if (payment.errors) {
            return res.status(400).json({ error: payment.errors });
        }

        // 3. Get PIX QR Code
        const pixResponse = await fetch(`${apiUrl}/payments/${payment.id}/pixQrCode`, {
            headers: { 'access_token': apiKey }
        });

        const pixData = await pixResponse.json();

        return res.status(200).json({
            id: payment.id,
            status: payment.status,
            invoiceUrl: payment.invoiceUrl,
            pix: {
                encodedImage: pixData.encodedImage, // Base64 QR Code
                payload: pixData.payload // Copy & Paste code
            }
        });

    } catch (error) {
        console.error('Asaas API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
