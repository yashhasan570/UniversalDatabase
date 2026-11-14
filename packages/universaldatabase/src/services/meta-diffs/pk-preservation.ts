/**
 * Pure helpers for column-property diff between Universal Database metadata and the
 * external DB schema, with asymmetric handling of `pk`.
 *
 * Customers can recover from external schemas that declare uniqueness via
 * `UNIQUE NOT NULL` instead of `PRIMARY KEY` (the no-PK family of read /
 * delete / link-create crashes) by manually flagging the `id` column as PK
 * in Universal Database. To make that flip durable, the diff is asymmetric on `pk`:
 *
 *   - `pk` *gained* on the DB side: propagate to Universal Database.
 *   - `pk` *lost* on the DB side while Universal Database has it: keep Universal Database's value.
 *
 * Other props (`rqd`, `un`, `ai`, `unique`) are propagated symmetrically.
 *
 * Tests in `tests/unit/helpersTest/pkPreservation.test.ts` lock the
 * behavior.
 */

/**
 * Subset of column attributes that meta-sync compares against the DB
 * schema: primary key, required (NOT NULL), unsigned, auto-increment,
 * UNIQUE. These are physical / schema-level properties — *not*
 * Universal Database-only metadata such as title, description, or uidt.
 */
export interface ColumnSchemaProps {
  pk?: boolean | null;
  rqd?: boolean | null;
  un?: boolean | null;
  ai?: boolean | null;
  unique?: boolean | null;
}

/** True when Universal Database has pk and the DB column does not. */
export function isPkRegression(
  noCoDbPk: boolean | null | undefined,
  dbPk: boolean | null | undefined,
): boolean {
  return !!noCoDbPk && !dbPk;
}

/**
 * Returns true if the schema-level props on `oldCol` (Universal Database metadata)
 * and `dbCol` (DB schema) disagree in a way that should fire
 * `TABLE_COLUMN_PROPS_CHANGED` and queue an apply.
 *
 * Compares only physical/constraint-like attributes (pk, rqd, un, ai,
 * unique) — not Universal Database-only metadata such as title or uidt.
 *
 * `pk` regressions alone do NOT fire — see module-level rationale.
 */
export function detectColumnSchemaPropsChanged(
  oldCol: ColumnSchemaProps,
  dbCol: ColumnSchemaProps,
): boolean {
  const pkChanged =
    !!oldCol.pk !== !!dbCol.pk && !isPkRegression(oldCol.pk, dbCol.pk);

  return (
    pkChanged ||
    !!oldCol.rqd !== !!dbCol.rqd ||
    !!oldCol.un !== !!dbCol.un ||
    !!oldCol.ai !== !!dbCol.ai ||
    !!oldCol.unique !== !!dbCol.unique
  );
}

/**
 * Returns the `pk` value to write back to Universal Database after a sync diff fires.
 * Acts as a ratchet — pk only goes from false to true, never back.
 */
export function resolvePkAfterSync(
  noCoDbPk: boolean | null | undefined,
  dbPk: boolean | null | undefined,
): boolean {
  return !!(dbPk || noCoDbPk);
}
