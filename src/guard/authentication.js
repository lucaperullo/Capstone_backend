import jwt from "jsonwebtoken";
import express from "express";
import UserModel from "../routes/users/schema.js";
import {
  authenticateUser,
  authorizeUser,
  refreshToken,
} from "../middlewares/jwt.js";
import { loginWare } from "../middlewares/loginWare.js";

import SpotifyWebApi from "spotify-web-api-node";

const authRoutes = express.Router();
// const SpotifyStrategy = passportSpotify.Strategy;

//TODO: add roles for groups
//TODO: share timing of the que of songs currently playing to allow to listen togheter the same song
const spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.REDIRECT_URI,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

authRoutes.post("/refreshToken", async (req, res, next) => {
  const oldRefreshToken = req.cookies.refreshToken;
  if (!oldRefreshToken) {
    const err = new Error("Refresh token missing");
    err.httpStatusCode = 400;
    next(err);
  } else {
    try {
      const newTokens = await refreshToken(oldRefreshToken);
      if (newTokens) {
        res.cookie("accessToken", newTokens.accessToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
          secure: process.env.NODE_ENV === "production" ? true : false,
        });
        res.cookie("refreshToken", newTokens.refreshToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
          secure: process.env.NODE_ENV === "production" ? true : false,
          path: "/refreshToken",
        });
        res.status(201).send({ ok: true });
      } else {
        const err = new Error("Provided refresh tocken is incorrect");
        err.httpStatusCode = 403;
        next(err);
      }
    } catch (error) {
      next(error);
    }
  }
});

authRoutes.post("/logout", authorizeUser, async (req, res, next) => {
  try {
    const user = req.user;
    user.refreshToken = user.refreshToken.filter((t) => t.token !== req.token);
    user.status.presence = "offline";
    user.save();

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).send({ message: "Successfully logged out." });
  } catch (e) {
    console.log(e);
    next(e);
  }
});

authRoutes.get("/users", authorizeUser, async (req, res, next) => {
  try {
    if (req.query.name) {
      const filteredUsers = await UserModel.find({
        username: { $regex: `.*${req.query.name}.*` },
      });
      res.send(filteredUsers);
    } else {
      const allUsers = await UserModel.find().select(
        "-contacts -rooms -email -phone -refreshToken"
      );

      res.send(allUsers);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

authRoutes.get("/auth/me", authorizeUser, async (req, res, next) => {
  try {
    // const user = await UserModel.findById(req.user._id).populate("rooms");

    res.send(req.user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

authRoutes.put("/auth/me", authorizeUser, async (req, res, next) => {
  try {
    const editedUser = await UserModel.findByIdAndUpdate(
      req.user._id,
      req.body,
      { runValidators: true, new: true }
    ).populate("rooms");

    res.send(editedUser);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

authRoutes.get("/auth/:id", authorizeUser, async (req, res, next) => {
  try {
    const singleUser = await UserModel.findById(req.params.id).populate(
      "rooms"
    );
    if (singleUser) {
      res.send(singleUser);
    } else {
      res.status(404).send({ message: "No user with this id exists" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

authRoutes.put("/auth/:id", authorizeUser, async (req, res, next) => {
  try {
    if (req.user._id === req.params.id) {
      const editedUser = await UserModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { runValidators: true, new: true }
      );
      if (editedUser) {
        res.send(editedUser);
      } else {
        res.status(404).send({ message: "No user with this id exists" });
      }
    } else {
      res.status(401).send({ message: "This is not your account" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// authRoutes.put(
//   "/me/upload",
//   authorizeUser,
//   cloudinaryMulter.single("ProfilePic"),
//   async (req, res, next) => {
//     try {
//       const addedIMG = await UserModel.findByIdAndUpdate(
//         req.user._id,
//         { profilePic: req.file.path },
//         { runValidators: true, new: true }
//       ).populate("rooms");
//       res.send(addedIMG);
//     } catch (error) {
//       console.log(error);
//       next(error);
//     }
//   }
// );

export default authRoutes;
