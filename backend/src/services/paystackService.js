const axios = require('axios');

const paystack = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
});

// amount must be passed in kobo (smallest currency unit)
async function initializeTransaction({ email, amount, reference, callback_url, metadata }) {
  const { data } = await paystack.post('/transaction/initialize', {
    email,
    amount,
    reference,
    callback_url,
    metadata,
  });
  return data.data; // { authorization_url, access_code, reference }
}

async function verifyTransaction(reference) {
  const { data } = await paystack.get(`/transaction/verify/${encodeURIComponent(reference)}`);
  return data.data; // { status, amount, reference, ... }
}

module.exports = { initializeTransaction, verifyTransaction };
