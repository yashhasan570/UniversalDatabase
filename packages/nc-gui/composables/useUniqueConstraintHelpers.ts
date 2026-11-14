import { type ColumnType } from 'universaldatabase-sdk'
import {
  canEnableUniqueConstraint as checkCanEnableUniqueConstraint,
  isUniqueConstraintSupportedType,
} from '~/utils/uniqueConstraintHelpers'

export function useUniqueConstraintHelpers() {
  return {
    isUniqueConstraintSupportedType,
    canEnableUniqueConstraint: (column: ColumnType, isXcdbBase: boolean) => checkCanEnableUniqueConstraint(column, isXcdbBase),
  }
}
