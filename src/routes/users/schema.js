import mongoose from "mongoose";
import bcrypt from "bcrypt";

const validateEmail = function (email) {
  const re = /^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/;
  return re.test(email);
};

const UserModel = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  spotifyId: {
    type: String,
    unique: true,
  },
  spotifyTokens: {
    access_token: String,
    refresh_token: String,
    expires_in:Number
  },
  appTheming: {
    theme: {
      type: Boolean,
      default: true,
    },
    backgroundColor: {
      type: String,
    },
    backgroundImage: {
      type: String,
    },
    bubbleChat: { type: String, default: "primary" },
  },
  bio: {
    type: String,
    default: "Hey there, Im new to Our-Music!",
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  musicHistory: { type: mongoose.Schema.Types.ObjectId, ref: "Music" },
  status: {
    music: {
      type: String,
      default: "",
    },
    presence: {
      type: String,
      required: true,
      default: "offline",
      enum: ["offline", "online", "busy", "noDisturb"],
    },
  },
  refreshToken: [{ type: String }],
  profilePic: {
    type: String,
    default: "https://i.ibb.co/Fm5L0fZ/user-default.png",
  },
  contacts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: "Room" }],
});

UserModel.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

UserModel.pre("save", async function (next) {
  const user = this;
  const plainPW = user.password;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPW, 8);
  }
  next();
});

UserModel.statics.findByCredentials = async function (username, password) {
  const user = await this.findOne({ username });

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

UserModel.statics.addRoomToUser = async function (userId, roomId) {
  try {
    const updatedUser = await this.findByIdAndUpdate(userId, {
      $addToSet: { rooms: roomId },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default mongoose.model("User", UserModel);
