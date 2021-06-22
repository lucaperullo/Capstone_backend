import { Server } from "socket.io";
import * as crypto from "crypto";
const createSocketServer = (server) => {
  const io = new Server(server);
  console.log(crypto.randomBytes(64).toString("hex"));
  io.on("connection", (socket) => {
    console.log("user connected");
  });
};

export default createSocketServer;
