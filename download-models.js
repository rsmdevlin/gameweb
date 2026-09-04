// Download script for free 3D models
// Run with: node download-models.js

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create models directory
const modelsDir = path.join(__dirname, 'client', 'public', 'models');
if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

// Free models with direct CDN links
const models = [
  {
    name: 'Soldier.glb',
    url: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/Soldier.glb'
  },
  {
    name: 'RobotExpressive.glb',
    url: 'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/models/gltf/RobotExpressive/RobotExpressive.glb'
  }
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${dest}...`);
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download: ${response.statusCode}`));
        return;
      }

      response.pipe(file);

      file.on('finish', () => {
        file.close();
        console.log(`✓ Downloaded ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Downloading free 3D models from Three.js CDN...\n');

  for (const model of models) {
    try {
      const dest = path.join(modelsDir, model.name);
      await downloadFile(model.url, dest);
    } catch (error) {
      console.error(`✗ Failed to download ${model.name}:`, error.message);
    }
  }

  console.log('\n✓ All models downloaded!');
  console.log(`Location: ${modelsDir}`);
}

downloadAll().catch(console.error);
