import type Universal Database from '~/Universal Database';

export default class XcAudit {
  public static init(app: Universal Database) {
    this.app = app;
  }

  // @ts-ignore
  private static app: Universal Database;

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async log(data: { base }) {}
}
