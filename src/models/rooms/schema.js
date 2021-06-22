import mongoose from "mongoose";
const { Schema, model } = mongoose;

const RoomSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  participants: [
    {
      user: { type: Schema.Types.ObjectId, ref: "user" },
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

RoomSchema.statics.addUserToRoom = async function (userId, roomId) {
  try {
    const updatedRoom = await this.findByIdAndUpdate(roomId, {
      $addToSet: { participants: { user: userId } },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
export default model("Room", RoomSchema);
