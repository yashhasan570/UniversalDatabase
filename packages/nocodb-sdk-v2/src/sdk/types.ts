import type { InternalApi as Api } from './lib/Api';

export interface UniversalDatabaseOptions {
  endPointURL?: string;
  apiKey?: string;
}

export type InternalAPI = Api<unknown>['api'];
