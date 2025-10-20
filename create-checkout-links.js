#!/usr/bin/env node

const https = require('https');

const API_TOKEN = 'polar_oat_0EihvUQHjwJ2Hm7F4kAET0IrlF67m3YkRYkkj2VAkv4';
const BASE_URL = 'api.polar.sh';

const products = [
  {
    name: 'GEOFORA Starter Plan',
    priceId: '16469485-e338-4a32-8113-862f0bf3bc79',
    plan: 'starter'
  },
  {
    name: 'GEOFORA Pro Plan', 
    priceId: '84e278db-382d-4f2a-8aff-64996a9b4942',
    plan: 'pro'
  },
  {
    name: 'GEOFORA Enterprise Plan',
    priceId: '8432fe8f-76a1-4e96-b08b-43837f4cbb75',
    plan: 'enterprise'
  }
];

function makeApiRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: BASE_URL,
      port: 443,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: responseData });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function createCheckoutLinks() {
  console.log('🚀 Creating checkout links for GEOFORA products...\n');
  
  for (const product of products) {
    try {
      console.log(`Creating checkout link for ${product.name}...`);
      
      const checkoutData = {
        product_price_id: product.priceId,
        label: `${product.name} - Monthly Subscription`,
        success_url: `https://geofora.ai/dashboard?plan=${product.plan}&status=success`,
        allow_discount_codes: true,
        require_billing_address: false
      };
      
      const response = await makeApiRequest('/v1/checkout-links', 'POST', checkoutData);
      
      if (response.status === 200 || response.status === 201) {
        console.log(`✅ Successfully created checkout link for ${product.name}`);
        console.log(`   Checkout URL: ${response.data.url || 'Generated successfully'}`);
      } else {
        console.log(`❌ Failed to create checkout link for ${product.name}`);
        console.log(`   Status: ${response.status}`);
        console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
      }
      
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error creating checkout link for ${product.name}: ${error.message}`);
      console.log('');
    }
  }
  
  console.log('🎉 Checkout link creation process completed!');
}

// Test API connection first
async function testConnection() {
  try {
    console.log('Testing API connection...');
    const response = await makeApiRequest('/v1/products');
    
    if (response.status === 200) {
      console.log('✅ API connection successful');
      return true;
    } else {
      console.log(`❌ API connection failed: ${response.status}`);
      console.log(`Response: ${JSON.stringify(response.data, null, 2)}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ API connection error: ${error.message}`);
    return false;
  }
}

async function main() {
  const connected = await testConnection();
  
  if (connected) {
    await createCheckoutLinks();
  } else {
    console.log('Cannot proceed without API connection');
  }
}

main().catch(console.error);