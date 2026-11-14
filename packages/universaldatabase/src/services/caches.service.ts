import { Injectable } from '@nestjs/common';
import UniversalDatabaseCache from '~/cache/UniversalDatabaseCache';

@Injectable()
export class CachesService {
  async cacheGet() {
    return await UniversalDatabaseCache.export();
  }

  async cacheDelete() {
    await UniversalDatabaseCache.destroy();
    return true;
  }
}
