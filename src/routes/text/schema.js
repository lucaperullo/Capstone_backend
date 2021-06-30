import mongoose from "mongoose";

const MessageModel = new mongoose.Schema({
  roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String },
  messagePic: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date },
});
export default mongoose.model("Text", MessageModel);
