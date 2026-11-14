import type { NcContext } from 'universaldatabase-sdk';
import type { MetaService } from '~/meta/meta.service';

export interface IColumnsV3Service {
  columnGet(
    context: NcContext,
    param: { columnId: string },
    ncMeta?: MetaService,
  ): Promise<any>;
}
