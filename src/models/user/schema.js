import mongoose from "mongoose";
import bcrypt from "bcrypt";
const { Schema, model } = mongoose;
const validateEmail = function (email) {
  const re = /^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/;
  return re.test(email);
};

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: [validateEmail, "Please fill a valid email address"],
    match: [
      /^\w+([.-]?\w+)@\w+([.-]?\w+)(.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
  },
  profilePic: {
    type: String,
    default:
      "https://media.discordapp.net/attachments/815874328108204045/856844965522046986/image-removebg-preview.png",
  },
  associates: [{ type: Schema.Types.ObjectId, ref: "user" }],
  rooms: [{ type: Schema.Types.ObjectId, ref: "room" }],
});

UserSchema.methods.toJSON = function () {
  const user = this;
  const userObject = user.toObject();

  delete userObject.password;
  delete userObject.__v;

  return userObject;
};

UserSchema.pre("save", async function (next) {
  const user = this;
  const plainPW = user.password;

  if (user.isModified("password")) {
    user.password = await bcrypt.hash(plainPW, 8);
  }
  next();
});

UserSchema.statics.findByCredentials = async function (email, password) {
  const user = await this.findOne({ email });

  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) return user;
    else return null;
  } else {
    return null;
  }
};

UserSchema.statics.addRoomToUser = async function (userId, roomId) {
  try {
    const updatedUser = await this.findByIdAndUpdate(userId, {
      $addToSet: { rooms: roomId },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default model("User", UserSchema);
