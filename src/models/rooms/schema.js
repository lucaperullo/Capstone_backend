import mongoose from "mongoose";

export const RoomModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      socketId: { type: String },
    },
  ],
  chatHistory: [
    {
      sender: { type: String },
      text: { type: String },
      createdAt: { type: String },
      attachment: { type: String },
    },
  ],
  images: {
    type: String,
  },
});

RoomModel.statics.addUserToRoom = async function (userId, roomId) {
  try {
    const updatedRoom = await this.findByIdAndUpdate(roomId, {
      $addToSet: { participants: { user: userId } },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export default mongoose.model("Room", RoomModel);
