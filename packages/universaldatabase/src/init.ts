import { MetaService } from '~/meta/meta.service';
import { NcConfig } from '~/utils/nc-config';
import Universal Database from '~/Universal Database';

// run upgrader
import NcUpgrader from '~/version-upgrader/NcUpgrader';

export default async () => {
  const config = await NcConfig.createByEnv();
  UniversalDatabase._ncMeta = new MetaService(config);
  await NcUpgrader.upgrade({ ncMeta: UniversalDatabase._ncMeta });
};
