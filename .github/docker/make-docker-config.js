// Derives the docker-entry rspack config from the main rspack.config.js
// (entry src/run/docker.ts -> dist/docker.js) so the two stay in sync.
const fs = require('fs');
let s = fs.readFileSync('packages/universaldatabase/rspack.config.js', 'utf8');
const before = s;
s = s.replace("entry: './src/index.ts'", "entry: './src/run/docker.ts'")
     .replace("filename: 'bundle.js'", "filename: 'docker.js'")
     // The generated config lives at /app/rspack.docker.config.cjs, so __dirname would point at
     // /app and send dist/docker.js to the wrong place. Resolve against the package cwd instead,
     // which is packages/universaldatabase for both this build and the normal one.
     .replace("path: resolve(__dirname, 'dist')", "path: resolve(process.cwd(), 'dist')")
     .replace(
       "resolve(__dirname, '../universaldatabase-integrations/packages')",
       "resolve(process.cwd(), '../universaldatabase-integrations/packages')"
     );
if (s === before) {
  console.error('rspack.config.js did not match expected entry/output patterns');
  process.exit(1);
}
fs.writeFileSync('/app/rspack.docker.config.cjs', s);
console.log('docker rspack config written');
