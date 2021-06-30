import mongoose from "mongoose";

export const MusicModel = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "music history",
    },
    history: [
      {
        type: String,
        unique: true,
      },
    ],
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Music", MusicModel);
