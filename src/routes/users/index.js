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
import { spotifyAuthentication } from "../../middlewares/spotifyAuthentication.js";

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

userRoutes.put(
  "/follow/:userId/:username",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const actualUser = req.user;
      const userToFollow = await UserSchema.findById(req.params.userId);

      if (actualUser.contacts.includes(userToFollow._id)) {
        const data = await req.spotifyApi.unfollowUsers([req.params.username]);
        console.log("unfollow", data);
        if (data.statusCode === 204) {
          actualUser.contacts = actualUser.contacts.filter(
            (u) => u.toString() !== userToFollow._id.toString()
          );

          actualUser.save();
          res.status(200).send({ message: "user unfollowed" });
        }
      } else {
        const data = await req.spotifyApi.followUsers([req.params.username]);
        if (data.statusCode === 204) {
          console.log("follow", data);
          actualUser.contacts = [...actualUser.contacts, userToFollow._id];
          const room = await createRooms(actualUser._id, userToFollow._id);
          console.log(room);
          userToFollow.rooms = [...userToFollow.rooms, room._id];
          actualUser.rooms = [...actualUser.rooms, room._id];
          await actualUser.save();
          await userToFollow.save();
          res.status(200).send({ message: "user followed" });
        }
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

// userRoutes.get("/:id", async (req, res, next) => {
//   const user = await UserSchema.findById(req.params.id);
//   if (user) {
//     res.send(user).status(200);
//   }
// });

userRoutes.delete("/deleteUser", authorizeUser, async (req, res, next) => {
  const user = await UserSchema.findByIdAndDelete(req.user._id);
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
