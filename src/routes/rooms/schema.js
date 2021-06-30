import mongoose from "mongoose";

export const RoomModel = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    playlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Music" }],
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        socketId: {
          type: String,
          unique: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Room", RoomModel);
