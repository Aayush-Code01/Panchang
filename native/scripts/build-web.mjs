// Copies the web app (../app + shared files) into www/ with flat paths for the native shell.
import { mkdirSync, readFileSync, writeFileSync, copyFileSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url)), root = resolve(here, '../..'), out = resolve(here, '../www');
rmSync(out, { recursive: true, force: true }); mkdirSync(out, { recursive: true });
let html = readFileSync(resolve(root, 'app/index.html'), 'utf8').replaceAll('../', './');
// the native shell ships its own splash and does not need the web service worker
html = html.replace(/navigator\.serviceWorker[\s\S]*?\.register\('sw\.js'/, m => m).replace("'serviceWorker' in navigator", "false");
writeFileSync(resolve(out, 'index.html'), html);
for (const f of ['astronomy.min.js', 'features.js', 'features.css', 'icon-180.png', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'icon-1024.png', 'og.jpg'])
  if (existsSync(resolve(root, f))) copyFileSync(resolve(root, f), resolve(out, f));
copyFileSync(resolve(root, 'app/manifest.webmanifest'), resolve(out, 'manifest.webmanifest'));
console.log('web app copied to', out);
