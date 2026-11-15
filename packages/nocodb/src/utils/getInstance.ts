import { ModelTypes } from 'universaldatabase-sdk';
import { CacheGetType, CacheScope, MetaTable } from './globals';
import Universal Database from '~/Universal Database';
import UniversalDatabaseCache from '~/cache/UniversalDatabaseCache';

export default async function (force = false, ncMeta = UniversalDatabase.ncMeta) {
  try {
    let res = await UniversalDatabaseCache.get(
      'root',
      CacheScope.INSTANCE_META,
      CacheGetType.TYPE_OBJECT,
    );
    if (!res || force) {
      const projectsMeta = await ncMeta
        .knex(MetaTable.PROJECT)
        .count('id as count')
        .first()
        .where('deleted', false)
        .where('is_meta', true)
        .then((c) => c.count);
      const projectsExt = await ncMeta
        .knex(MetaTable.PROJECT)
        .count('id as count')
        .first()
        .where('deleted', false)
        .where('is_meta', false)
        .then((c) => c.count);
      const impacted = await ncMeta
        .knex(MetaTable.USERS)
        .where(function () {
          this.where('is_deleted', false).orWhereNull('is_deleted');
        })
        .count('id as count')
        .first()
        .then((c) => c.count);
      const created = await ncMeta
        .knex(MetaTable.STORE)
        .select('created_at')
        .where('key', 'nc_server_id')
        .first()
        .then((c) => c.created_at);
      const files = await ncMeta
        .knex(MetaTable.FILE_REFERENCES)
        .count('storage as count')
        .first()
        .then((c) => c.count);
      const tables = await ncMeta
        .knex(MetaTable.MODELS)
        .whereIn('type', [ModelTypes.TABLE, ModelTypes.VIEW])
        .where((qb) => qb.where('deleted', false).orWhereNull('deleted'))
        .count('id as count')
        .first()
        .then((c) => c.count);
      const views = await ncMeta
        .knex(MetaTable.VIEWS)
        .where((qb) => qb.where('deleted', false).orWhereNull('deleted'))
        .count('id as count')
        .first()
        .then((c) => c.count);

      const nc_db_type = UniversalDatabase.getConfig()?.meta?.db?.client;

      res = {
        projectsMeta,
        projectsExt,
        impacted,
        nc_db_type,
        created,
        files,
        tables,
        views,
      };
      await UniversalDatabaseCache.set('root', CacheScope.INSTANCE_META, res);
    }
    return res;
  } catch {
    return {};
  }
}
