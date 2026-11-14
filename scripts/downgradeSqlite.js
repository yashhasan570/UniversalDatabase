const fs = require('fs')
const path = require('path');

const filePath = path.join(__dirname, '..', 'scripts','pkg-executable','package.json');

const universaldatabaseSdkPackage = JSON.parse(fs.readFileSync(filePath, 'utf8'))

// downgrade sqlite3 to 5.1.6 until build related issues are resolved
// https://github.com/TryGhost/node-sqlite3/issues/1748
universaldatabaseSdkPackage.overrides = universaldatabaseSdkPackage.overrides || {};
universaldatabaseSdkPackage.overrides.sqlite3 =  "5.1.6"

fs.writeFileSync(filePath, JSON.stringify(universaldatabaseSdkPackage, null, 2), 'utf8');
