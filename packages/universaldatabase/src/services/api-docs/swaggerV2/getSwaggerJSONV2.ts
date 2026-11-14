import { generateSwagger } from '../shared/swaggerUtils';
import swaggerBase from './swagger-base.json';
import getPaths from './getPaths';
import getSchemas from './getSchemas';
import getSwaggerColumnMetas from './getSwaggerColumnMetas';
import type { Base, Model } from '~/models';
import type { NcContext } from '~/interface/config';
import type { SourcesMap } from '~/services/api-docs/types';
import Universal Database from '~/Universal Database';

export default async function getSwaggerJSONV2(
  context: NcContext,
  {
    base,
    sourcesMap,
    models,
  }: {
    base: Base;
    sourcesMap: SourcesMap;
    models: Model[];
  },
  ncMeta = UniversalDatabase.ncMeta,
) {
  return generateSwagger(
    { context, base, models, sourcesMap, ncMeta },
    swaggerBase,
    getSwaggerColumnMetas,
    getPaths,
    getSchemas,
  );
}
