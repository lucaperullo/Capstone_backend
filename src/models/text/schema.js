import { Schema } from "mongoose";
export const MessageSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
    },
    sender: { type: Schema.Types.ObjectId, ref: "Users" },
    room: { type: Schema.Types.ObjectId, ref: "Rooms" },
  },
  { timestamps: true }
);
