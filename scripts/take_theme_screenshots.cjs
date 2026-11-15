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

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Capture the Loading Screen while active
  console.log('Navigating to capture loading screen...');
  await page.goto('http://localhost:5174/', { waitUntil: 'domcontentloaded' });
  // Wait 700ms so progress is ~45% and status message is visible
  await new Promise(r => setTimeout(r, 700));
  await page.screenshot({ path: path.join(outDir, 'loading_screen_active.png') });
  console.log('Saved: loading_screen_active.png');

  // 2. Wait for loading screen to complete its smooth transition
  await new Promise(r => setTimeout(r, 2200));

  // Dismiss age gate if visible
  await page.evaluate(() => {
    localStorage.setItem('mogwrld_age_verified_v1', 'true');
  });

  // Reload or capture loaded homepage
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  // Wait for loading screen to fade
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(outDir, 'home_with_new_logo_desktop.png') });
  console.log('Saved: home_with_new_logo_desktop.png');

  // 3. Mobile viewport
  await page.setViewport({ width: 375, height: 812, isMobile: true });
  await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(outDir, 'home_with_new_logo_mobile.png') });
  console.log('Saved: home_with_new_logo_mobile.png');

  // 4. Shop Page
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://localhost:5174/shop', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 2500));
  await page.screenshot({ path: path.join(outDir, 'shop_with_new_logo.png') });
  console.log('Saved: shop_with_new_logo.png');

  await browser.close();
  console.log('All theme screenshots captured!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
