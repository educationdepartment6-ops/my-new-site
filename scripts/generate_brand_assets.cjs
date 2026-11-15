const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/Aditya/.gemini/antigravity/brain/88f17c08-cbcc-4f54-a0fe-d4ebb9130412/.user_uploaded/media_1794597678817.jpg';
const brandDir = 'C:/Users/Aditya/.gemini/antigravity/scratch/react-app/public/brand';

async function generatePerfectAssets() {
  console.log('Generating flawless brand assets with distance-field alpha masking...');

  // 1. Central wordmark with needle spikes
  const wordmarkBox = { left: 5, top: 410, width: 1014, height: 200 };
  const { data: rawData, info } = await sharp(srcPath)
    .extract(wordmarkBox)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;

  // Step A: Mark all core dark pixels (letters, needles, molecule lines)
  const isCore = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const r = rawData[idx];
      const g = rawData[idx + 1];
      const b = rawData[idx + 2];
      const brightness = (r + g + b) / 3;
      // Core text/needle is dark
      if (brightness < 185) {
        isCore[y * width + x] = 1;
      }
    }
  }

  // Step B: Calculate Manhattan distance to nearest core pixel (capped at 25px)
  // Two-pass distance transform
  const dist = new Float32Array(width * height);
  const INF = 999;
  for (let i = 0; i < dist.length; i++) {
    dist[i] = isCore[i] ? 0 : INF;
  }

  // Forward pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (dist[idx] > 0) {
        if (x > 0) dist[idx] = Math.min(dist[idx], dist[idx - 1] + 1);
        if (y > 0) dist[idx] = Math.min(dist[idx], dist[(y - 1) * width + x] + 1);
      }
    }
  }

  // Backward pass
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const idx = y * width + x;
      if (dist[idx] > 0) {
        if (x < width - 1) dist[idx] = Math.min(dist[idx], dist[idx + 1] + 1);
        if (y < height - 1) dist[idx] = Math.min(dist[idx], dist[(y + 1) * width + x] + 1);
      }
    }
  }

  // Step C: Compute alpha based on brightness and distance
  // Only pixels within 16px of core can have alpha.
  // Beyond 16px: alpha is guaranteed 0.
  const maxDist = 16;
  const outData = Buffer.from(rawData);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const d = dist[y * width + x];
      const r = outData[idx];
      const g = outData[idx + 1];
      const b = outData[idx + 2];
      const brightness = (r + g + b) / 3;

      if (d > maxDist || brightness > 238) {
        outData[idx + 3] = 0;
      } else {
        // Distance falloff factor (1 at core, 0 at maxDist)
        const distFactor = Math.pow(Math.max(0, (maxDist - d) / maxDist), 1.5);
        // Brightness falloff (1 for dark, 0 for white)
        const brightFactor = Math.max(0, (238 - brightness) / 200);
        const alpha = Math.min(255, Math.round(255 * Math.min(1, brightFactor * 1.8) * distFactor));
        outData[idx + 3] = alpha;
      }
    }
  }

  // Trim and save clean logo.png
  const cleanLogo = await sharp(outData, {
    raw: { width, height, channels: 4 }
  }).trim().png().toBuffer();

  await sharp(cleanLogo).toFile(path.join(brandDir, 'logo.png'));
  console.log('Saved seamless logo.png');

  // Dark variant
  const darkLogoData = Buffer.from(outData);
  for (let i = 0; i < darkLogoData.length; i += 4) {
    const a = darkLogoData[i + 3];
    if (a > 0) {
      const r = darkLogoData[i];
      const g = darkLogoData[i + 1];
      const b = darkLogoData[i + 2];
      darkLogoData[i] = Math.min(255, Math.round(255 - r * 0.75));
      darkLogoData[i + 1] = Math.min(255, Math.round(255 - g * 0.75));
      darkLogoData[i + 2] = Math.min(255, Math.round(255 - b * 0.75));
    }
  }

  await sharp(darkLogoData, {
    raw: { width, height, channels: 4 }
  }).trim().png().toFile(path.join(brandDir, 'logo-dark.png'));
  console.log('Saved seamless logo-dark.png');

  // 2. Molecule Icon with distance mask
  const molBox = { left: 286, top: 440, width: 98, height: 130 };
  const { data: molRaw, info: molInfo } = await sharp(srcPath)
    .extract(molBox)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let i = 0; i < molRaw.length; i += 4) {
    const brightness = (molRaw[i] + molRaw[i + 1] + molRaw[i + 2]) / 3;
    if (brightness > 235) {
      molRaw[i + 3] = 0;
    } else {
      const factor = Math.max(0, (235 - brightness) / 100);
      molRaw[i + 3] = Math.min(255, Math.round(255 * factor));
    }
  }

  await sharp(molRaw, {
    raw: { width: molInfo.width, height: molInfo.height, channels: 4 }
  }).trim().png().toFile(path.join(brandDir, 'molecule-icon.png'));
  console.log('Saved seamless molecule-icon.png');

  // 3. Top-Left Liquid Chrome Swoosh with Smooth 140px Edge Feathering
  const tlBox = { left: 0, top: 0, width: 620, height: 380 };
  const { data: tlRaw, info: tlInfo } = await sharp(srcPath)
    .extract(tlBox)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const featherSpan = 140;
  for (let y = 0; y < tlInfo.height; y++) {
    for (let x = 0; x < tlInfo.width; x++) {
      const idx = (y * tlInfo.width + x) * 4;
      const brightness = (tlRaw[idx] + tlRaw[idx + 1] + tlRaw[idx + 2]) / 3;

      // Calculate edge feather for bottom (y -> height) and right (x -> width)
      const distFromBottom = tlInfo.height - 1 - y;
      const distFromRight = tlInfo.width - 1 - x;

      const fadeY = distFromBottom < featherSpan ? distFromBottom / featherSpan : 1;
      const fadeX = distFromRight < featherSpan ? distFromRight / featherSpan : 1;
      const edgeFade = Math.sin((fadeX * Math.PI) / 2) * Math.sin((fadeY * Math.PI) / 2);

      // Also fade near-white background
      let bgFade = 1;
      if (brightness >= 245) {
        bgFade = 0;
      } else if (brightness > 220) {
        bgFade = (245 - brightness) / 25;
      }

      tlRaw[idx + 3] = Math.round(255 * edgeFade * bgFade);
    }
  }

  await sharp(tlRaw, {
    raw: { width: tlInfo.width, height: tlInfo.height, channels: 4 }
  }).png().toFile(path.join(brandDir, 'chrome-swoosh-tl.png'));
  console.log('Saved feathered chrome-swoosh-tl.png');

  // 4. Bottom-Right Liquid Chrome Swoosh with Smooth 140px Edge Feathering
  const brBox = { left: 380, top: 620, width: 644, height: 404 };
  const { data: brRaw, info: brInfo } = await sharp(srcPath)
    .extract(brBox)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  for (let y = 0; y < brInfo.height; y++) {
    for (let x = 0; x < brInfo.width; x++) {
      const idx = (y * brInfo.width + x) * 4;
      const brightness = (brRaw[idx] + brRaw[idx + 1] + brRaw[idx + 2]) / 3;

      // Calculate edge feather for top (y -> 0) and left (x -> 0)
      const distFromTop = y;
      const distFromLeft = x;

      const fadeY = distFromTop < featherSpan ? distFromTop / featherSpan : 1;
      const fadeX = distFromLeft < featherSpan ? distFromLeft / featherSpan : 1;
      const edgeFade = Math.sin((fadeX * Math.PI) / 2) * Math.sin((fadeY * Math.PI) / 2);

      let bgFade = 1;
      if (brightness >= 245) {
        bgFade = 0;
      } else if (brightness > 220) {
        bgFade = (245 - brightness) / 25;
      }

      brRaw[idx + 3] = Math.round(255 * edgeFade * bgFade);
    }
  }

  await sharp(brRaw, {
    raw: { width: brInfo.width, height: brInfo.height, channels: 4 }
  }).png().toFile(path.join(brandDir, 'chrome-swoosh-br.png'));
  console.log('Saved feathered chrome-swoosh-br.png');

  console.log('All seamless brand assets successfully created.');
}

generatePerfectAssets().catch(console.error);
