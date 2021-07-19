import express from "express";
import UserSchema from "./schema.js";
import { createRooms } from "../../chat/utilities.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import jwt from "jsonwebtoken";
import SpotifyWebApi from "spotify-web-api-node";
import axios from "axios";
import { authorizeUser } from "../../middlewares/jwt.js";

const userRoutes = express.Router();

userRoutes.get("/me", authorizeUser, async (req, res, next) => {
  try {
    const user = await UserSchema.findById(req.user._id);

    res.send(user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

userRoutes.put("/follow/:userId", authorizeUser, async (req, res, next) => {
  try {
    const actualUser = req.user;
    const userToFollow = await UserSchema.findById(req.params.userId);

    if (actualUser.contacts.includes(userToFollow._id)) {
      actualUser.contacts = actualUser.contacts.filter(
        (u) => u.toString() !== userToFollow._id.toString()
      );

      actualUser.save();
      res.status(200).send({ message: "user unfollowed" });
    } else {
      actualUser.contacts = [...actualUser.contacts, userToFollow._id];
      const roomIdx = await createRooms(actualUser._id, userToFollow._id);
      console.log(roomIdx);
      userToFollow.rooms = [...userToFollow.rooms, roomIdx];
      actualUser.rooms = [...actualUser.rooms, roomIdx];
      await actualUser.save();
      await userToFollow.save();
      res.status(200).send({ message: "user followed" });
    }
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

userRoutes.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken,
  });

  spotifyApi
    .refreshAccessToken()
    .then((data) => {
      res.json({
        accessToken: data.body.accessToken,
        expiresIn: data.body.expiresIn,
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

export default userRoutes;
