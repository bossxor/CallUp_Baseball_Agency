#!/usr/bin/env node
/**
 * Copy callup-shell dist into apk-src/assets/public/callup-shell
 * and replace public/index.html so WebView boots the new shell only.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const dist = path.join(root, 'shell', 'dist');
const publicDir = path.join(root, 'apk-src', 'assets', 'public');
const shellOut = path.join(publicDir, 'callup-shell');

if (!fs.existsSync(dist)) {
  console.error('MISS shell/dist — run tools/build-shell.ps1');
  process.exit(1);
}

fs.rmSync(shellOut, { recursive: true, force: true });
fs.mkdirSync(shellOut, { recursive: true });

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dest, name);
    if (fs.statSync(s).isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}
copyDir(dist, shellOut);

const distIndex = fs.readFileSync(path.join(dist, 'index.html'), 'utf8').replace(/\r\n/g, '\n');
fs.writeFileSync(path.join(shellOut, 'index.html'), distIndex, 'utf8');
let rewritten = distIndex
  .replace(/(href|src)="\.\/shell-assets\//g, '$1="./callup-shell/shell-assets/')
  .replace(/(href|src)="\/shell-assets\//g, '$1="./callup-shell/shell-assets/')
  .replace(/(href|src)="shell-assets\//g, '$1="./callup-shell/shell-assets/');

const preload = `
    <script type="module">
      import * as eng from './assets/engine-DhPc-c_J.js';
      window.CallUpEngine = eng;
      // Bring Capacitor/Filesystem used by legacy disk saves (slot*.json).
      try {
        await import('./assets/disk-ClprvGM1.js');
      } catch (e) {
        console.warn('disk preload', e);
      }
    </script>`;
if (!rewritten.includes('CallUpEngine')) {
  rewritten = rewritten.replace(/^\s*<\/head>/m, `${preload}\n  </head>`);
} else if (!rewritten.includes('disk-ClprvGM1')) {
  rewritten = rewritten.replace(
    'window.CallUpEngine = eng;',
    `window.CallUpEngine = eng;
      try { await import('./assets/disk-ClprvGM1.js'); } catch (e) { console.warn('disk preload', e); }`
  );
}

const bak = path.join(publicDir, 'index.signhere-shell.html.bak');
const cur = path.join(publicDir, 'index.html');
if (!fs.existsSync(bak) && fs.existsSync(cur)) {
  fs.copyFileSync(cur, bak);
}
fs.writeFileSync(cur, rewritten, 'utf8');
console.log('ok inject-shell');
