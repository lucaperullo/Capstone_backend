import { Server } from "socket.io";

import {
  addMessageToRoom,
  addUserSocketToRoom,
  getUsersInRoom,
  removeUserSocketFromRoom,
  updateRoomCanvas,
} from "./socketRoutes.js";

const createSocketServer = (server) => {
  const io = new Server(server);
  io.on("connection", (socket) => {
    console.log("new connection:", socket.id);

    socket.on("JOIN_ROOM", async (data) => {
      try {
        socket.join(data.roomId);

        await addUserSocketToRoom(data, socket.id);

        const onlineMessage = {
          sender: "Corporate God: Jeff Bazos",
          text: `${data.username} is now online`,
          createdAt: new Date(),
        };

        socket.to(data.roomId).broadcast.emit("CHAT_MESSAGE", onlineMessage);

        const userList = await getUsersInRoom(data.roomId);
        io.to(data.roomId).emit("roomData", {
          room: data.roomId,
          list: userList,
        });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("music", (data) =>
      socket.to(data.roomId).broadcast.emit("music", data)
    );

    socket.on("LEAVE_ROOM", async (data) => {
      try {
        socket.leave(data.roomId);

        await removeUserSocketFromRoom(data, socket.id);

        const offlineMessage = {
          sender: "Corporate God: Jeff Bazos",
          text: `${data.username} is now offline`,
          createdAt: new Date(),
        };

        socket.to(data.roomId).broadcast.emit("CHAT_MESSAGE", offlineMessage);

        const userList = await getUsersInRoom(data.roomId);
        io.to(data.roomId).emit("roomData", {
          room: data.roomId,
          list: userList,
        });
      } catch (error) {
        console.log(error);
      }
    });

    socket.on("CHAT_MESSAGE", async (data) => {
      await addMessageToRoom(data);
      socket.to(data.roomId).emit("CHAT_MESSAGE", data);
    });

    socket.on("CANVAS_DATA", async (data) => {
      await updateRoomCanvas(data);
    });

    socket.on("error", (data) => console.log(data));
  });

  io.on("error", (data) => console.log(data));
};

export default createSocketServer;
