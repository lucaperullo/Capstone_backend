import mongoose from "mongoose";

export const MusicModel = new mongoose.Schema(
  {
    liked: [
      {
        songId: String,
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        songName: String,
        artist: String,
        album: String,
        albumArt: String,
        duration: Number,
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
