const fs = require('fs');
const path = require('path');

function updateManifestWithConfig() {
  try {
    // Read config file
    const configPath = path.join(__dirname, 'config.json');
    const manifestPath = path.join(__dirname, 'manifest.json');

    if (!fs.existsSync(configPath)) {
      console.log('⚠️  config.json not found. Using placeholder values.');
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    let manifestContent = fs.readFileSync(manifestPath, 'utf8');

    // Replace placeholders with actual values
    manifestContent = manifestContent
      .replace('{{REDIRECT_URI}}', config.redirectUri || '')
      .replace('{{CLIENT_ID}}', config.clientId || '')
      .replace('{{CLIENT_SECRET}}', config.clientSecret || '');

    // Write updated manifest to dist folder
    const distManifestPath = path.join(__dirname, 'dist', 'manifest.json');
    fs.writeFileSync(distManifestPath, manifestContent);

    console.log('✅ Manifest updated with OAuth configuration');

    if (!config.redirectUri || !config.clientId || !config.clientSecret) {
      console.log('⚠️  Missing OAuth credentials in config.json');
    }

  } catch (error) {
    console.error('❌ Error updating manifest:', error.message);
  }
}

module.exports = { updateManifestWithConfig };