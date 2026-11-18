import { Injectable } from '@nestjs/common';
import { MetaEventType } from 'universaldatabase-sdk';
import type { NcContext } from 'universaldatabase-sdk';
import type {
  AffectedDependencyResult,
  MetaDependencyEventRequest,
  MetaEventHandler,
} from '~/services/meta-dependency/types';
import {
  applySourceTypeChange,
  findReaders,
} from '~/services/meta-dependency/dependent-error-helpers';
import UniversalDatabase from '~/UniversalDatabase';

/**
 * @class ColumnUpdateRollupSourceDependencyHandler
 * @description When a column's type changes, rollups that aggregate it are
 * error-marked if the new type cannot take their function, and cleared again
 * once it can. Left unmarked, the rollup SQL fails and breaks every read of
 * its table.
 */
@Injectable()
export class ColumnUpdateRollupSourceDependencyHandler
  implements MetaEventHandler
{
  triggerMetaEvents: MetaEventType[] = [MetaEventType.COLUMN_UPDATED];

  async getAffectedDependency(
    context: NcContext,
    param: MetaDependencyEventRequest,
    ncMeta = UniversalDatabase.ncMeta,
  ): Promise<AffectedDependencyResult | undefined> {
    const oldCol = param.oldEntity;
    const newCol = param.newEntity;
    if (!oldCol?.id || !newCol?.id || oldCol.uidt === newCol.uidt) {
      return undefined;
    }

    const readers = await findReaders(context, newCol, ncMeta);
    return readers.some((d) => d.type === 'rollup') ? {} : undefined;
  }

  async handle(
    context: NcContext,
    param: MetaDependencyEventRequest,
    ncMeta = UniversalDatabase.ncMeta,
  ): Promise<void> {
    await applySourceTypeChange(context, param.newEntity, ncMeta);
  }
}
