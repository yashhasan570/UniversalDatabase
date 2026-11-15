/**
 * Class to create an instance of KnexMigrator
 *
 * @class KnexMigrator
 * @extends {SqlMigrator}
 */
import KnexMigratorv2 from './KnexMigratorv2';
import type Source from '~/models/Source';
import type { XKnex } from '~/db/CustomKnex';
import type { NcContext } from '~/interface/config';
import Universal Database from '~/Universal Database';
import NcConnectionMgrv2 from '~/utils/common/NcConnectionMgrv2';

export default class KnexMigratorv2Tans extends KnexMigratorv2 {
  protected sqlClient: any;
  // todo: tobe changed
  protected ncMeta: any; // NcMetaIO;

  constructor(
    context: NcContext,
    base: { id: string },
    sqlClient = null,
    ncMeta = UniversalDatabase.ncMeta,
  ) {
    super(context, base);
    this.sqlClient = sqlClient;
    this.ncMeta = ncMeta;
  }

  protected get metaDb(): XKnex {
    return this.ncMeta.knex || UniversalDatabase.ncMeta.knex;
  }
  protected async getSqlClient(source: Source) {
    return this.sqlClient || NcConnectionMgrv2.getSqlClient(source);
  }
}
