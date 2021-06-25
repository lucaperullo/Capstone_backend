import mongoose from "mongoose";

const MessageModel = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String },
  messagePic: { type: String },
  createdAt: { type: Date },
  updatedAt: { type: Date, required: true },
});
export default mongoose.model("Text", MessageModel);
