import  MessageSchema  from "../models/text/schema.js";
import RoomModel  from "../models/rooms/schema.js";
import  UserModel  from "../models/users/schema.js";

export const addUserSocketToRoom = async (data, socketId) => {
  try {
    await RoomModel.findOneAndUpdate(
      {
        id: data.roomId,
        "partecipants.user": data.userId,
      },
      { "partecipants.$.socketId": socketId }
    );
  } catch (error) {
    console.log(error);
  }
};

export const removeUserSocketFromRoom = async (data) => {
  try {
    await RoomModel.findOneAndUpdate(
      {
        _id: data.roomId,
        "partecipants.user": data.userId,
      },
      { "partecipants.$.socketId": "" }
    );
  } catch (error) {
    console.log(error);
  }
};

export const getUsersInRoom = async (roomId) => {
  try {
    const room = await RoomModel.findById(roomId);
    return room.partecipants;
  } catch (error) {
    console.log(error);
  }
};

export const addMessageToRoom = async (data) => {
  try {
    await RoomModel.findByIdAndUpdate(data.roomId, {
      $push: {
        chatHistory: {
          sender: data.sender,
          text: data.text,
          createdAt: data.createdAt,
          attachment: data.attachment,
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
};

export const updateRoomCanvas = async (data) => {
  try {
    await RoomModel.findByIdAndUpdate(data.roomId, {
      images: data.canvasData,
    });
  } catch (error) {
    console.log(error);
  }
};
