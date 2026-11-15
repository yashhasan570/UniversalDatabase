import type { Server } from 'socket.io';
import type { NcSocket } from '~/interface/config';

export default class UniversalDatabasePresence {
  public static setupHandlers(_socket: NcSocket) {}

  public static handleDisconnect(_socket: NcSocket, _ioServer: Server) {}
}
