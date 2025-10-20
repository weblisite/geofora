#!/usr/bin/env node

// Generate checkout URLs for GEOFORA products
// Since the API calls are timing out, we'll generate the URLs manually

const products = [
  {
    name: 'GEOFORA Starter Plan',
    productId: 'd0730b9c-f150-47fb-b07c-8e523b246db8',
    priceId: '16469485-e338-4a32-8113-862f0bf3bc79',
    plan: 'starter',
    price: '$299/month'
  },
  {
    name: 'GEOFORA Pro Plan', 
    productId: '66a68545-b8ea-46ca-b508-fc39bf0a8c50',
    priceId: '84e278db-382d-4f2a-8aff-64996a9b4942',
    plan: 'pro',
    price: '$499/month'
  },
  {
    name: 'GEOFORA Enterprise Plan',
    productId: '80465f02-cc68-4791-a688-b6238dfdbd5c',
    priceId: '8432fe8f-76a1-4e96-b08b-43837f4cbb75',
    plan: 'enterprise',
    price: '$999/month'
  }
];

const organizationId = '96a0e428-6186-4c65-bedc-782397b8de3e';

console.log('🚀 GEOFORA Checkout URLs Generated\n');

products.forEach((product, index) => {
  console.log(`${index + 1}. ${product.name} (${product.price})`);
  console.log(`   Product ID: ${product.productId}`);
  console.log(`   Price ID: ${product.priceId}`);
  console.log(`   Direct Product URL: https://polar.sh/${organizationId}/products/${product.productId}`);
  console.log(`   Checkout URL: https://polar.sh/${organizationId}/products/${product.productId}/checkout`);
  console.log(`   Success URL: https://geofora.ai/dashboard?plan=${product.plan}&status=success`);
  console.log('');
});

console.log('📝 Next Steps:');
console.log('1. Make organization public in Polar.sh dashboard');
console.log('2. Test the checkout URLs above');
console.log('3. Update frontend with working checkout URLs');
console.log('4. Deploy to production');

console.log('\n🔗 Frontend Integration:');
console.log('Update shared/polar-service.ts with these URLs:');
console.log('');

const polarServiceUpdate = `export const POLAR_CHECKOUT_LINKS = {
  starter: 'https://polar.sh/${organizationId}/products/${products[0].productId}/checkout',
  professional: 'https://polar.sh/${organizationId}/products/${products[1].productId}/checkout',
  enterprise: 'https://polar.sh/${organizationId}/products/${products[2].productId}/checkout'
};`;

console.log(polarServiceUpdate);
