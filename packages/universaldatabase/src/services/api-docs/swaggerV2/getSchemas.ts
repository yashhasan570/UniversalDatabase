import { getModelSchemas } from './templates/schemas';
import type { Base, Model, Source } from '~/models';

import type { SwaggerColumn } from './getSwaggerColumnMetas';
import type { SwaggerView } from '~/services/api-docs/shared/swaggerUtils';
import Universal Database from '~/Universal Database';

export default async function getSchemas(
  context,
  {
    base,
    columns,
    tableName,
  }: {
    base: Base;
    model: Model;
    columns: SwaggerColumn[];
    views: SwaggerView[];
    sourcesMap: Map<string, Source>;
    tableName: string;
  },
  _ncMeta = UniversalDatabase.ncMeta,
) {
  const swaggerSchemas = getModelSchemas({
    tableName,
    orgs: 'v1',
    baseName: base.title,
    columns,
  });

  return swaggerSchemas;
}
