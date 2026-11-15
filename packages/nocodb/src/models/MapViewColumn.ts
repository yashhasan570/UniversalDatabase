import type { BoolType } from 'universaldatabase-sdk';
import type { NcContext } from '~/interface/config';
import View from '~/models/View';
import Universal Database from '~/Universal Database';
import UniversalDatabaseCache from '~/cache/UniversalDatabaseCache';
import { CacheGetType, CacheScope, MetaTable } from '~/utils/globals';
import { extractProps } from '~/helpers/extractProps';
import { replayedViewColumnId } from '~/helpers/viewColumnReplay';

export default class MapViewColumn {
  id: string;
  show?: BoolType;
  order?: number;

  fk_view_id: string;
  fk_column_id: string;
  fk_workspace_id?: string;
  base_id?: string;
  source_id?: string;

  constructor(data: MapViewColumn) {
    Object.assign(this, data);
  }

  public static async get(
    context: NcContext,
    mapViewColumnId: string,
    ncMeta = UniversalDatabase.ncMeta,
  ) {
    let viewColumn =
      mapViewColumnId &&
      (await UniversalDatabaseCache.get(
        context,
        `${CacheScope.MAP_VIEW_COLUMN}:${mapViewColumnId}`,
        CacheGetType.TYPE_OBJECT,
      ));
    if (!viewColumn) {
      viewColumn = await ncMeta.metaGet2(
        context.workspace_id,
        context.base_id,
        MetaTable.MAP_VIEW_COLUMNS,
        mapViewColumnId,
      );
      if (viewColumn) {
        await UniversalDatabaseCache.set(
          context,
          `${CacheScope.MAP_VIEW_COLUMN}:${mapViewColumnId}`,
          viewColumn,
        );
      }
    }
    return viewColumn && new MapViewColumn(viewColumn);
  }
  static async insert(
    context: NcContext,
    column: Partial<MapViewColumn>,
    ncMeta = UniversalDatabase.ncMeta,
  ) {
    const insertObj: Record<string, any> = {
      fk_view_id: column.fk_view_id,
      fk_column_id: column.fk_column_id,
      order: await ncMeta.metaGetNextOrder(MetaTable.MAP_VIEW_COLUMNS, {
        fk_view_id: column.fk_view_id,
      }),
      show: column.show,
      base_id: column.base_id,
      source_id: column.source_id,
    };

    const replayId = replayedViewColumnId(
      insertObj.fk_view_id,
      insertObj.fk_column_id,
    );
    if (replayId) insertObj.id = replayId;

    if (!insertObj.source_id) {
      const viewRef = await View.get(
        context,
        insertObj.fk_view_id,
        false,
        ncMeta,
      );
      insertObj.source_id = viewRef.source_id;
    }

    const { id } = await ncMeta.metaInsert2(
      context.workspace_id,
      context.base_id,
      MetaTable.MAP_VIEW_COLUMNS,
      insertObj,
    );

    return this.get(context, id, ncMeta).then(async (viewCol) => {
      await UniversalDatabaseCache.appendToList(
        context,
        CacheScope.MAP_VIEW_COLUMN,
        [column.fk_view_id],
        `${CacheScope.MAP_VIEW_COLUMN}:${id}`,
      );
      return viewCol;
    });
  }

  public static async list(
    context: NcContext,
    viewId: string,
    ncMeta = UniversalDatabase.ncMeta,
  ): Promise<MapViewColumn[]> {
    const cachedList = await UniversalDatabaseCache.getList(
      context,
      CacheScope.MAP_VIEW_COLUMN,
      [viewId],
    );
    let { list: views } = cachedList;
    const { isNoneList } = cachedList;
    if (!isNoneList && !views.length) {
      views = await ncMeta.metaList2(
        context.workspace_id,
        context.base_id,
        MetaTable.MAP_VIEW_COLUMNS,
        {
          condition: {
            fk_view_id: viewId,
          },
          orderBy: {
            order: 'asc',
          },
        },
      );
      await UniversalDatabaseCache.setList(
        context,
        CacheScope.MAP_VIEW_COLUMN,
        [viewId],
        views,
      );
    }
    views.sort(
      (a, b) =>
        (a.order != null ? a.order : Infinity) -
        (b.order != null ? b.order : Infinity),
    );
    return views?.map((v) => new MapViewColumn(v));
  }

  // todo: update prop names
  static async update(
    context: NcContext,
    columnId: string,
    body: Partial<MapViewColumn>,
    ncMeta = UniversalDatabase.ncMeta,
  ) {
    const updateObj = extractProps(body, [
      'order',
      'show',
      'width',
      'group_by',
      'group_by_order',
      'group_by_sort',
    ]);

    // set meta
    const res = await ncMeta.metaUpdate(
      context.workspace_id,
      context.base_id,
      MetaTable.MAP_VIEW_COLUMNS,
      updateObj,
      columnId,
    );

    // get existing cache
    const key = `${CacheScope.MAP_VIEW_COLUMN}:${columnId}`;
    await UniversalDatabaseCache.update(context, key, updateObj);

    // on view column update, delete any optimised single query cache
    {
      const viewCol = await this.get(context, columnId, ncMeta);
      if (viewCol?.fk_view_id) {
        const view = await View.get(context, viewCol.fk_view_id, false, ncMeta);
        if (view) {
          await View.clearSingleQueryCache(context, view.fk_model_id, [view]);
        }
      }
    }

    return res;
  }
}
