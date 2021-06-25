import mongoose from "mongoose";

export const RoomModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    chatHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Text",
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
