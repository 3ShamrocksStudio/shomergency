/* Copies the live SHOMER PWA into the Capacitor web dir.
   The native app runs the EXACT same codebase — one product, two shells. */
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');   // repo root
const WWW  = path.resolve(__dirname, '..', 'www');

const FILES = [
  'shomer.html', 'sw.js', 'manifest.json', 'version.json',
  'SHOMER_logo_big.png', 'SHOMER-bg.jpg',
  'logo-192.png', 'logo-512.png', 'badge-192.png', 'badge-512.png',
  'nature-badge.png', 'nature-bg.jpg'
];

fs.mkdirSync(WWW, { recursive: true });
for (const f of FILES) {
  const src = path.join(ROOT, f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(WWW, f));
    console.log('copied', f);
  }
}
// the native shell boots straight into the app
fs.copyFileSync(path.join(ROOT, 'shomer.html'), path.join(WWW, 'index.html'));

// guide artwork
const guideSrc = path.join(ROOT, 'img', 'guide');
if (fs.existsSync(guideSrc)) {
  const guideDst = path.join(WWW, 'img', 'guide');
  fs.mkdirSync(guideDst, { recursive: true });
  for (const f of fs.readdirSync(guideSrc)) {
    fs.copyFileSync(path.join(guideSrc, f), path.join(guideDst, f));
  }
  console.log('copied guide artwork');
}
// native bridge
fs.copyFileSync(path.resolve(__dirname, '..', 'native-bridge.js'), path.join(WWW, 'native-bridge.js'));
console.log('web assets ready in', WWW);
