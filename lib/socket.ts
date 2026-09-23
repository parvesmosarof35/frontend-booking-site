import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

const DEFAULT_SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  'https://bookingplatfrom-backend-gyq1rh-a97459-2-24-82-111.sslip.io';

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(DEFAULT_SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
    });
  }
  return socket;
};
