import { type NcContext, parseProp } from 'universaldatabase-sdk';
import type { LinksColumn } from '~/models';
import { type Column } from '~/models';
import UniversalDatabase from '~/UniversalDatabase';

export const getCustomLinkParam = async (
  _context: NcContext,
  {
    col,
  }: { col: Column; colOptions: LinksColumn; mapId?: (id: string) => string },
  _ncMeta = UniversalDatabase.ncMeta,
) => {
  if (!parseProp(col.meta).custom) {
    return;
  }
};
