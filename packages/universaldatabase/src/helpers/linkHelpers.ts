import { type NcContext, parseProp } from 'universaldatabase-sdk';
import type { LinksColumn } from '~/models';
import { type Column } from '~/models';
import Universal Database from '~/Universal Database';

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
