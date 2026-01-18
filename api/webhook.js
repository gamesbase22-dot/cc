export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { event, payment } = req.body;
    const asaasToken = req.headers['asaas-access-token']; // If configured in Asaas Webhook settings

    // Optional: Verify Token if you set it up in Asaas
    // if (process.env.ASAAS_WEBHOOK_TOKEN && asaasToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
    //    return res.status(401).json({ error: 'Unauthorized' });
    // }

    console.log(`[Webhook] Event: ${event} | Payment ID: ${payment?.id}`);

    try {
        if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
            // Logic to unlock access for the user
            // In a real app, you would look up the user associated with this payment ID (e.g. from 'externalReference' or metadata) and update their database record.

            console.log(`✅ Payment ${payment.id} confirmed! Value: ${payment.value}`);

            // Example Database Update (Pseudo-code)
            // const userEmail = payment.customerEmail; or payment.externalReference
            // await db.collection('users').doc(userId).update({ plan: 'active', type: 'premium' });

            return res.status(200).json({ received: true });
        }

        if (event === 'PAYMENT_OVERDUE') {
            console.log(`⚠️ Payment ${payment.id} is overdue.`);
            // Update status to 'expired' or 'overdue'
            return res.status(200).json({ received: true });
        }

        // Handle other events...
        return res.status(200).json({ received: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}