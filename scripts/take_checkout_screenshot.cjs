const puppeteer = require('puppeteer-core');
const path = require('path');

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outDir = 'C:/Users/Aditya/.gemini/antigravity/brain/88f17c08-cbcc-4f54-a0fe-d4ebb9130412/screenshots';

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('mogwrld_age_verified_v1', 'true');
    const mockCart = {
      state: {
        items: [
          {
            key: 'bpc-157_BC5',
            productSlug: 'bpc-157',
            productName: 'BPC-157',
            category: 'tissue-repair',
            variantLabel: '5mg/vial (Pack of 10)',
            sku: 'BC5',
            unitPrice: 42.41,
            quantity: 2,
            batchNumber: 'MW-BPC-26B'
          }
        ]
      },
      version: 0
    };
    localStorage.setItem('mogwrld_cart_storage', JSON.stringify(mockCart));
  });

  await page.goto('http://localhost:4173/checkout', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'checkout_active.png') });
  console.log('Saved checkout_active.png');

  await page.goto('http://localhost:4173/cart', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(outDir, 'cart_active.png') });
  console.log('Saved cart_active.png');

  await browser.close();
}

run().catch(console.error);
