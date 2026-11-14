import { SqlUiFactory } from 'universaldatabase-sdk';
import type Source from '~/models/Source';
import type Column from '~/models/Column';
import type { ColumnType } from 'universaldatabase-sdk';

export default function getColumnUiType(
  source: Source,
  column: Column | ColumnType,
) {
  const sqlUi = SqlUiFactory.create({ client: source.type });
  return sqlUi.getMetaUIDataType(column as ColumnType);
}
