const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const srcPath = 'C:/Users/Aditya/.gemini/antigravity/brain/88f17c08-cbcc-4f54-a0fe-d4ebb9130412/.user_uploaded/media_1794597678817.jpg';
const brandDir = 'C:/Users/Aditya/.gemini/antigravity/scratch/react-app/public/brand';
const publicDir = 'C:/Users/Aditya/.gemini/antigravity/scratch/react-app/public';

fs.mkdirSync(brandDir, { recursive: true });

async function processImages() {
  // 1. Copy the full artwork to brand-full.jpg and brand-full.png
  await sharp(srcPath).jpeg({ quality: 95 }).toFile(path.join(brandDir, 'brand-full.jpg'));
  await sharp(srcPath).png().toFile(path.join(brandDir, 'brand-full.png'));

  // 2. Crop the central wordmark
  // The wordmark with needles spans roughly y: 400 to 620, x: 10 to 1014
  const cropped = await sharp(srcPath)
    .extract({ left: 10, top: 410, width: 1004, height: 200 })
    .png()
    .toBuffer();

  // Save the cropped wordmark on light background
  await sharp(cropped).toFile(path.join(brandDir, 'logo-wordmark-solid.png'));

  // Make a clean transparent cutout of the logo wordmark:
  // Pixels close to white (#FFFFFF / #F7F8FA) become transparent
  const { data, info } = await sharp(cropped).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // Brightness calculation
    const brightness = (r + g + b) / 3;
    if (brightness > 240) {
      // Map brightness 240..255 to alpha 0
      const diff = 255 - brightness;
      data[i + 3] = Math.max(0, Math.min(255, Math.round((diff / 15) * 180)));
    } else if (brightness > 225) {
      // Soft transition for anti-aliasing
      const alphaFactor = (255 - brightness) / 30;
      data[i + 3] = Math.min(255, Math.round(255 * alphaFactor));
    }
  }

  const transparentLogo = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 }
  }).trim().png().toBuffer();

  await sharp(transparentLogo).toFile(path.join(brandDir, 'logo.png'));
  await sharp(transparentLogo).toFile(path.join(brandDir, 'logo-transparent.png'));

  // 3. Generate OG image (1200x630) using the full brand artwork
  await sharp(srcPath)
    .resize(1200, 630, { fit: 'cover', position: 'center' })
    .png()
    .toFile(path.join(publicDir, 'og-image.png'));

  // 4. Crop the central hexagonal molecule for favicon
  // Molecule is roughly in the center of "mog"
  const moleculeIcon = await sharp(srcPath)
    .extract({ left: 280, top: 430, width: 120, height: 130 })
    .trim()
    .png()
    .toBuffer();

  await sharp(moleculeIcon).toFile(path.join(brandDir, 'molecule-icon.png'));

  // Save as favicon
  await sharp(moleculeIcon)
    .resize(64, 64, { fit: 'contain', background: { r: 245, g: 246, b: 248, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.png'));

  console.log('Successfully generated all brand assets from uploaded logo image.');
}

processImages().catch(console.error);
