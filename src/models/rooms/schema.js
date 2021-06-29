import mongoose from "mongoose";

export const RoomModel = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chatHistory: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String },
        messagePic: { type: String },
        createdAt: { type: Date },
        updatedAt: { type: Date },
      },
    ],
    images: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Room", RoomModel);
