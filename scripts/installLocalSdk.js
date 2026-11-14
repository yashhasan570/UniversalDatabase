const { exec } = require('child_process');
const path = require('path');
const sdkPath = path.join(__dirname, '..', 'packages', 'universaldatabase-sdk');
const guiPath = path.join(__dirname, '..', 'packages', 'nc-gui');
const universaldatabasePath = path.join(__dirname, '..', 'packages', 'universaldatabase');

exec(`cd ${sdkPath} && pnpm i && npm run build`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error installing dependencies and building universaldatabase-sdk: ${err}`);
      return;
    }
    
    console.log(`Dependencies installed and universaldatabase-sdk built: ${stdout}`);

    const guiPromise = new Promise((resolve, reject) => {
      exec(`cd ${guiPath} && pnpm i ${sdkPath}`, (err, stdout, stderr) => {
        if (err) {
          reject(`Error installing dependencies for nc-gui: ${err}`);
        } else {
          resolve(`Dependencies installed for nc-gui: ${stdout}`);
        }
      });
    });
  
    const universaldatabasePromise = new Promise((resolve, reject) => {
      exec(`cd ${universaldatabasePath} && pnpm i ${sdkPath}`, (err, stdout, stderr) => {
        if (err) {
          reject(`Error installing dependencies for universaldatabase: ${err}`);
        } else {
          resolve(`Dependencies installed for universaldatabase: ${stdout}`);
        }
      });
    });

    Promise.all([guiPromise, universaldatabasePromise])
      .then((results) => {
        console.log(results.join('\n'));
      })
      .catch((err) => {
        console.error(err);
      });
  });