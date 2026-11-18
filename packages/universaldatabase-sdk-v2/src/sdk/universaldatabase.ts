import { InternalApi } from './lib/Api.ts';
import type { InternalAPI, UniversalDatabaseOptions } from './types';
import { Workspace } from './workspace';

class UniversalDatabase {
  private static _endPointURL = 'https://app.universaldatabase.com';
  private static _apiKey: string;
  private readonly internalAPI: InternalAPI;

  constructor(
    options: UniversalDatabaseOptions = {
      endPointURL: 'https://app.universaldatabase.com',
    },
  ) {
    const endPointURL = options.endPointURL || UniversalDatabase._endPointURL;
    const apiKey = options.apiKey || UniversalDatabase._apiKey;

    if (!apiKey) {
      throw new Error(
        'apiKey is required. Provide it in the constructor options or use UniversalDatabase.configure().',
      );
    }

    this.internalAPI = new InternalApi({
      baseURL: endPointURL,
      headers: {
        ['xc-token']: apiKey,
      },
    }).api;
  }

  static configure(options: UniversalDatabaseOptions): void {
    if (!options) {
      throw new Error(
        'options is required. Provide it in the constructor options or use UniversalDatabase.configure().',
      );
    }

    if (!options.apiKey) {
      throw new Error(
        'apiKey is required. Provide it in the constructor options or use UniversalDatabase.configure().',
      );
    }

    UniversalDatabase._endPointURL = options.endPointURL || UniversalDatabase._endPointURL;
    UniversalDatabase._apiKey = options.apiKey;
  }

  workspace(id: string): Workspace {
    return new Workspace(this.internalAPI, id);
  }
}
