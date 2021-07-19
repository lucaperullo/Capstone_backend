import MessageModel from "../routes/messages/schema.js";
import RoomModel from "../routes/rooms/schema.js";
import UserModel from "../routes/users/schema.js";

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
    // console.log(error);
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
    // console.log(error);
  }
};

export const getUsersInRoom = async (roomId) => {
  try {
    const room = await RoomModel.findById(roomId);
    return room.partecipants;
  } catch (error) {
    // console.log(error);
  }
};

export const addMessage = async (data) => {
  try {
    const newMessage = await new MessageModel({
      roomId: data.roomId,
      senderId: data.senderId,
      text: data.text,
    });
    newMessage.save();
  } catch (error) {
    // console.log(error);
  }
};

export const updateRoomCanvas = async (data) => {
  try {
    await RoomModel.findByIdAndUpdate(data.roomId, {
      images: data.canvasData,
    });
  } catch (error) {
    // console.log(error);
  }
};
