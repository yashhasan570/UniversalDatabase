import { SSLUsage } from 'universaldatabase-sdk';
import {
  buildSqlAuthSsl,
  knexConfigFromSqlAuthConfig,
  sslModeFromConfig,
} from 'universaldatabase-sdk';
import type {
  KnexSqlSslValue,
  SqlAuthConnectionConfig,
  SqlSslConfig,
} from 'universaldatabase-sdk';

// The SSL mode vocabulary and its knex mapping live in the SDK so that the DB
// auth integrations and the built-in "Database" data-source form resolve a
// mode the same way. They used to carry separate implementations that
// disagreed about `Preferred`: this one did not verify the server, the form
// did.
export { SSLUsage, buildSqlAuthSsl, sslModeFromConfig };
export type { KnexSqlSslValue, SqlAuthConnectionConfig };

// One connection definition for an SQL auth integration: the app connection
// and a base data source on the same row both build it here.
export { knexConfigFromSqlAuthConfig };

/** @deprecated use `SqlSslConfig` from `universaldatabase-sdk`. */
export type SqlAuthSslConfig = SqlSslConfig;
