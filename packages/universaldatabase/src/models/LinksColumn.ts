import type { RollupColumn } from '~/models/';
import type { NcContext } from '~/interface/config';
import { Column } from '~/models/';
import LinkToAnotherRecordColumn from '~/models/LinkToAnotherRecordColumn';
import UniversalDatabase from '~/UniversalDatabase';
import { setModelContext } from '~/helpers/modelContext';

export default class LinksColumn
  extends LinkToAnotherRecordColumn
  implements RollupColumn
{
  rollup_function = 'count' as RollupColumn['rollup_function'];
  error: string;

  get fk_relation_column_id() {
    return this.fk_column_id;
  }
  get fk_rollup_column_id() {
    if (this.type === 'hm') {
      return this.fk_child_column_id;
    } else if (this.type === 'mm') {
      return this.fk_parent_column_id;
    } else if (this.type === 'bt') {
      return this.fk_parent_column_id;
    } else if (this.type === 'oo') {
      return this.fk_parent_column_id;
    }
    // Default fallback for any other types (mo, om, etc.)
    return this.fk_parent_column_id;
  }

  async getRelationColumn(ncMeta = UniversalDatabase.ncMeta): Promise<Column> {
    return await Column.get(this.context, { colId: this.fk_column_id }, ncMeta);
  }

  async getRollupColumn(ncMeta = UniversalDatabase.ncMeta): Promise<Column> {
    // The rollup column lives in the related table — use refContext for cross-base
    const { refContext } = this.getRelContext();
    return await Column.get(
      refContext,
      { colId: this.fk_rollup_column_id },
      ncMeta,
    );
  }

  public static async read(
    context: NcContext,
    columnId: string,
    ncMeta = UniversalDatabase.ncMeta,
  ) {
    const colData = await super.read(context, columnId, ncMeta);
    if (!colData) return null;
    const instance = new LinksColumn(colData);
    setModelContext(instance, context);
    return instance;
  }

  public static async insert(
    context: NcContext,
    data: Partial<LinksColumn>,
    ncMeta = UniversalDatabase.ncMeta,
  ) {
    const colData = await super.insert(context, data, ncMeta);
    if (!colData) return null;
    const instance = new LinksColumn(colData);
    setModelContext(instance, context);
    return instance;
  }
}
