import mongoose from "mongoose";

export const MessageModel = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    room: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  },
  { timestamps: true }
);
export default mongoose.model("Text", MessageModel);
