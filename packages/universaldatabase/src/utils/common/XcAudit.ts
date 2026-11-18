import type UniversalDatabase from '~/UniversalDatabase';

export default class XcAudit {
  public static init(app: UniversalDatabase) {
    this.app = app;
  }

  // @ts-ignore
  private static app: UniversalDatabase;

  // @ts-ignore
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async log(data: { base }) {}
}
