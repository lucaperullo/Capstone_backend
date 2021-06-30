import express from "express";
import UserSchema from "./schema.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import jwt from "jsonwebtoken";

import axios from "axios";
import { authorizeUser} from "../../middlewares/jwt.js";

const userRoutes = express.Router();


userRoutes.get("/me", authorizeUser, async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.user._id).populate("rooms");
    res.send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userRoutes.get("/:id", async (req, res, next) => {
  const user = await UserSchema.findById(req.params.id);
  if (user) {
    res.send(user).status(200);
  }
});

userRoutes.delete("/:id", async (req, res, next) => {
  const user = await UserSchema.findByIdAndDelete(req.params.id);
  if (user) {
    res.send({ message: "user destroyed" }).status(204);
  }
});

export default userRoutes;
