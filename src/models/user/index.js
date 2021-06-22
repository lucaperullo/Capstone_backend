import express from "express";
import UserSchema from "./schema.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import jwt from "jsonwebtoken";

import axios from "axios";

const userRoutes = express.Router();

userRoutes.get("/me", async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  const decoded = await jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
  const user = (req.userData = decoded).sub[0];

  console.log(user._id);

  await axios
    .get(`http://localhost:5000/${user._id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      const updatedUser = response.data;
      res.status(200).send(updatedUser);
    });
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
