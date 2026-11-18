// Derives the docker-entry rspack config from the main rspack.config.js
// (entry src/run/docker.ts -> dist/docker.js) so the two stay in sync.
const fs = require('fs');
let s = fs.readFileSync('packages/universaldatabase/rspack.config.js', 'utf8');
const before = s;
s = s.replace("entry: './src/index.ts'", "entry: './src/run/docker.ts'")
     .replace("filename: 'bundle.js'", "filename: 'docker.js'");
if (s === before) {
  console.error('rspack.config.js did not match expected entry/output patterns');
  process.exit(1);
}
fs.writeFileSync('/app/rspack.docker.config.cjs', s);
console.log('docker rspack config written');
