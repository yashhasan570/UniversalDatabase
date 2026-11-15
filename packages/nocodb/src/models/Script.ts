import type { NcContext } from '~/interface/config';
import Universal Database from '~/Universal Database';

export default class Script {
  constructor(_unknown: any) {
    Object.assign(this, _unknown);
  }

  public static async get(
    _context: NcContext,
    _param1: string,
    _includeDeleted = false,
    _ncMeta = UniversalDatabase.ncMeta,
  ) {
    return null;
  }

  public static async list(
    _context: NcContext,
    _param1: string,
    _includeDeleted = false,
    _ncMeta = UniversalDatabase.ncMeta,
  ) {
    return [];
  }

  static async softDelete(..._args: any) {}

  static async delete(
    _context: NcContext,
    _param1: any,
    _ncMeta = UniversalDatabase.ncMeta,
  ) {
    return true;
  }

  public static async update(
    _context: NcContext,
    _param1: string,
    _param2: Partial<any>,
    _ncMeta = UniversalDatabase.ncMeta,
  ) {
    return {};
  }

  public static async insert(
    _context: NcContext,
    _param1: string,
    _param2: Partial<any>,
    _ncMeta = UniversalDatabase.ncMeta,
  ) {
    return {};
  }
}
