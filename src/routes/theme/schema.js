import mongoose from "mongoose";

const ThemeModel = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  theme: {
    type: boolean,
    default: true,
  },
  backgroundColor: {
    type: string,
  },
  backgroundImage: {
    type: string,
  },
});

export default mongoose.model("Theme", ThemeModel);
