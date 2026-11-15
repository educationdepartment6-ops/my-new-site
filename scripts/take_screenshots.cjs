const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const outDir = 'C:/Users/Aditya/.gemini/antigravity/brain/88f17c08-cbcc-4f54-a0fe-d4ebb9130412/screenshots';
fs.mkdirSync(outDir, { recursive: true });

async function run() {
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const targets = [
    { url: 'http://localhost:4173/', file: 'home_desktop.png', width: 1440, height: 900 },
    { url: 'http://localhost:4173/', file: 'home_mobile.png', width: 360, height: 740, isMobile: true },
    { url: 'http://localhost:4173/shop', file: 'shop_desktop.png', width: 1440, height: 900 },
    { url: 'http://localhost:4173/product/bpc-157', file: 'product_desktop.png', width: 1440, height: 900 },
    { url: 'http://localhost:4173/coa', file: 'coa_desktop.png', width: 1440, height: 900 },
    { url: 'http://localhost:4173/checkout', file: 'checkout_desktop.png', width: 1440, height: 900 }
  ];

  for (const t of targets) {
    const page = await browser.newPage();
    await page.setViewport({ width: t.width, height: t.height, isMobile: !!t.isMobile });
    // Dismiss age gate automatically in local storage
    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('mogwrld_age_verified_v1', 'true');
    });
    await page.goto(t.url, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: path.join(outDir, t.file) });
    console.log(`Saved screenshot: ${t.file}`);
    await page.close();
  }

  await browser.close();
  console.log('All screenshots captured successfully.');
}

run().catch(err => {
  console.error('Screenshot error:', err);
  process.exit(1);
});
