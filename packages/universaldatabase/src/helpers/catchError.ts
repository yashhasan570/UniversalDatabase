import { DBErrorExtractor } from './db-error/extractor';
import type { DBErrorExtractResult } from './db-error/utils';
import type { NcContext } from 'universaldatabase-sdk';
import type { ClientType } from 'universaldatabase-sdk';
export {
  NcBaseError,
  NcBaseErrorv2,
  NcErrorArgs,
  OptionsNotExistsError,
  BadRequestV2 as BadRequest,
  MetaError,
  SsoError,
  NotFound,
  UnprocessableEntity,
  Unauthorized,
  TestConnectionError,
  Forbidden,
  ExternalError,
  ExternalTimeout,
} from 'universaldatabase-sdk';
// Import UniqueConstraintViolationError directly from error module
// as it may not be exported from the main SDK index
export { UniqueConstraintViolationError } from 'universaldatabase-sdk';
export { AjvError, NcError } from '~/helpers/ncError';

// extract db errors using database error code
export function extractDBError(
  error,
  context?: NcContext & {
    clientType?: ClientType;
  },
): DBErrorExtractResult {
  return DBErrorExtractor.get().extractDbError(error, context);
}
