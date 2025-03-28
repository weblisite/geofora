const crypto = require('crypto');
const fs = require('fs');

// Read the webhook payload
const payload = fs.readFileSync('webhook_payload.json', 'utf8');

// Use the webhook secret from .env or a test value
const webhookSecret = process.env.POLAR_WEBHOOK_SECRET || 'test_webhook_secret';

// Create HMAC using the webhook secret
const hmac = crypto.createHmac('sha256', webhookSecret);

// Update HMAC with the payload
hmac.update(payload);

// Get the signature
const signature = hmac.digest('hex');

console.log(`Signature: ${signature}`);
console.log(`Payload Length: ${payload.length} bytes`);
console.log('\nTest cURL command:');
console.log(`curl -X POST http://localhost:5000/api/webhooks/polar \\
  -H "Content-Type: application/json" \\
  -H "Polar-Signature: ${signature}" \\
  --data @webhook_payload.json`);
