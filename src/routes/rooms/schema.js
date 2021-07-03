import mongoose from "mongoose";

const RoomModel = new mongoose.Schema(
  {
    playlist: [{ type: mongoose.Schema.Types.ObjectId, ref: "Music" }],
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        socketId: {
          type: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Room", RoomModel);
