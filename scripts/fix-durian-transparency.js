/**
 * Script to remove white background from durian.png
 * Converts white pixels (#FFFFFF or near-white) to transparent
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, '../assets/images');
const durianPath = path.join(imageDir, 'durian.png');
const outputPath = path.join(imageDir, 'durian-fixed.png');

async function removeWhiteBackground() {
  try {
    console.log('📦 Processing durian.png to remove white background...');

    // Read the image and convert to raw RGBA
    const image = sharp(durianPath);
    const metadata = await image.metadata();
    
    console.log(`Image size: ${metadata.width}x${metadata.height}`);

    // Process the image: convert white pixels to transparent
    const processed = image
      .ensureAlpha()  // Ensure alpha channel exists
      .composite([
        {
          input: Buffer.from([255, 255, 255, 0]), // Transparent if white
          tile: true,
          gravity: 'northwest'
        }
      ]);

    // Alternative approach: use a threshold-based method
    const buffer = await sharp(durianPath)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixelData = buffer.data;
    const { width, height, channels } = buffer.info;

    // Process each pixel: if R, G, B are all > 240 (near white), make alpha = 0
    for (let i = 0; i < pixelData.length; i += channels) {
      const r = pixelData[i];
      const g = pixelData[i + 1];
      const b = pixelData[i + 2];
      const a = pixelData[i + 3];

      // If pixel is bright white (near #FFFFFF), make it transparent
      if (r > 240 && g > 240 && b > 240 && a > 200) {
        pixelData[i + 3] = 0;  // Set alpha to 0 (transparent)
      }
    }

    // Create new image from modified pixel data
    const result = sharp(pixelData, {
      raw: {
        width,
        height,
        channels,
      }
    }).png();

    await result.toFile(outputPath);
    
    console.log('✅ Fixed image saved to: durian-fixed.png');
    console.log('⚠️  Backup created. Original: durian.png, Fixed: durian-fixed.png');
    console.log('\n📝 Next steps:');
    console.log('1. Review durian-fixed.png to verify the fix');
    console.log('2. If satisfied, replace the original:');
    console.log('   rm assets/images/durian.png');
    console.log('   mv assets/images/durian-fixed.png assets/images/durian.png');
    console.log('3. Restart the app to see the changes');

  } catch (error) {
    console.error('❌ Error processing image:', error.message);
    process.exit(1);
  }
}

removeWhiteBackground();
