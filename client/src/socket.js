import { io } from "socket.io-client";

const socket = io(import.meta.env.V_S_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

export default socket;