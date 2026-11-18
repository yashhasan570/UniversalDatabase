import path from 'path';
import cors from 'cors';
import express from 'express';

import UniversalDatabase from '~/UniversalDatabase';
import { handleUncaughtErrors } from '~/utils';
import { ncStaticCompression, ncStaticOptions } from '~/helpers/staticAssets';
handleUncaughtErrors(process);

const server = express();
server.use(cors());
server.use(
  process.env.NC_DASHBOARD_URL ?? '/',
  ncStaticCompression(),
  express.static(path.join(__dirname, 'nc-gui'), ncStaticOptions),
);
server.set('view engine', 'ejs');

(async () => {
  const httpServer = server.listen(process.env.PORT || 8080, async () => {
    console.log(`App started successfully.\nVisit -> ${UniversalDatabase.dashboardUrl}`);
    server.use(await UniversalDatabase.init({}, httpServer, server));
  });
})().catch((e) => console.log(e));
