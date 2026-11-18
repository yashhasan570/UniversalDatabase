import type { NcContext } from 'universaldatabase-sdk';
import UniversalDatabase from '~/UniversalDatabase';

export async function getBaseSchema(
  _context: NcContext,
  _ncMeta = UniversalDatabase.ncMeta,
) {
  // Not Implemented
}

export async function cleanBaseSchemaCacheForBase(_baseId: string) {
  // Not Implemented
}

export async function cleanBaseSchemaCacheForWorkspace(_workspaceId: string) {
  // Not Implemented
}
