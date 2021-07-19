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
//TODO: set up passportSpotify
//TODO: get user playlist on login
//TODO: add roles for groups
//TODO: share timing of the que of songs currently playing to allow to listen togheter the same song
const spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.REDIRECT_URI,
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});
const scopes =
  "ugc-image-upload user-read-recently-played user-read-playback-state user-top-read playlist-modify-public user-modify-playback-state playlist-modify-private user-follow-modify user-read-currently-playing user-follow-read user-library-modify user-read-playback-position playlist-read-private user-read-private user-library-read playlist-read-collaborative streaming";

authRoutes.get("/login/spotify", async (req, res, next) => {
  try {
    res.redirect(
      "https://accounts.spotify.com/authorize" +
        "?response_type=code" +
        "&client_id=" +
        process.env.CLIENT_ID +
        (scopes && "&scope=" + encodeURIComponent(scopes)) +
        "&redirect_uri=" +
        encodeURIComponent(process.env.REDIRECT_URI)
    );
  } catch (error) {
    console.log(error);
    next(error);
  }
});

authRoutes.post("/login/spotify/callback", async (req, res, next) => {
  const code = await req.body.code;
  if (code !== undefined) {
    try {
      console.log("THIS IS CODE", code);
      const data = await spotifyApi.authorizationCodeGrant(code);
      spotifyApi.setAccessToken(data.body.access_token);
      let user = await spotifyApi.getMe();
      user = user.body;
      const generatedUser = {
        spotifyId: user.id,
        username: user.display_name,
        password: user.id,
        profilePic: user.images[0].url,
      };

      const existingUser = await UserModel.findOne({
        username: generatedUser.username,
      });
      if (existingUser && existingUser.username.length > 0) {
        console.log({ this_is_blabla1: existingUser });
        const tokens = await authenticateUser(existingUser);
        console.log({ EXISTING: tokens });
        let existing = true;
        if (existing) {
          res.cookie("accessToken", tokens.accessToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
            secure: process.env.NODE_ENV === "production" ? true : false,
          });
          res.cookie("refreshToken", tokens.refreshToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
            secure: process.env.NODE_ENV === "production" ? true : false,
          });
          res.send({
            refreshToken: data.body.refresh_token,
            accessToken: data.body.access_token,
            expiresIn: data.body.expires_in,
          });
          return
        }

        //
      } else {
        console.log({ this_is_blabla2: existingUser });
        const newUser = await UserModel.create(generatedUser);
        const tokens = await authenticateUser(newUser);
        console.log({ WASnotEXISTING: tokens });

        res.cookie("accessToken", tokens.accessToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
          secure: process.env.NODE_ENV === "production" ? true : false,
        });
        res.cookie("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
          secure: process.env.NODE_ENV === "production" ? true : false,
        });
        res.send({
          refreshToken: data.body.refresh_token,
          accessToken: data.body.access_token,
          expiresIn: data.body.expires_in,
        });
        return;
      }
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
});
// authRoutes.post("/login/spotify", async (req, res, next) => {
//   try {
//     const code = req.body.code;

//     const spotifyApi = new SpotifyWebApi({
//       redirectUri: process.env.REDIRECT_URI,
//       clientId: process.env.CLIENT_ID,
//       clientSecret: process.env.CLIENT_SECRET,
//     });

//     const data = await spotifyApi.authorizationCodeGrant(code);
//     const SPOTIFYaccessToken = data.body.access_token;
//     const SPOTIFYrefreshToken = data.body.refresh_token;
//     const SPOTIFYexpiresIn = data.body.expires_in;

//     if (data) {
//       spotifyApi.setAccessToken(SPOTIFYaccessToken);
//       const user = await spotifyApi.getMe();

//       const spotiUser = user.body;
//       if (spotiUser) {
//         try {
//           const generatedUser = {
//             spotifyId: spotiUser.id,
//             username: spotiUser.display_name,
//             password: spotiUser.id,
//             profilePic: spotiUser.images[0].url,
//           };

//           const existingUser = await UserModel.findOne({
//             username: generatedUser.username,
//           });
//           if (existingUser && existingUser.username.length > 0) {
//             console.log({ this_is_blabla1: existingUser });
//             const tokens = await authenticateUser(existingUser);
//             console.log({ EXISTING: tokens });
//             res.cookie("accessToken", tokens.accessToken, {
//               httpOnly: true,
//               sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
//               secure: process.env.NODE_ENV === "production" ? true : false,
//             });
//             res.cookie("refreshToken", tokens.refreshToken, {
//               httpOnly: true,
//               sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
//               secure: process.env.NODE_ENV === "production" ? true : false,
//             });
//             res.send({
//               refreshToken: SPOTIFYrefreshToken,
//               accessToken: SPOTIFYaccessToken,
//               expiresIn: SPOTIFYexpiresIn,
//             });
//             //
//           } else {
//             console.log({ this_is_blabla2: existingUser });
//             const newUser = await UserModel.create(generatedUser);
//             const tokens = await authenticateUser(newUser);
//             console.log({ WASnotEXISTING: tokens });

//             res.cookie("accessToken", tokens.accessToken, {
//               httpOnly: true,
//               sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
//               secure: process.env.NODE_ENV === "production" ? true : false,
//             });
//             res.cookie("refreshToken", tokens.refreshToken, {
//               httpOnly: true,
//               sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
//               secure: process.env.NODE_ENV === "production" ? true : false,
//             });
//             res.send({
//               refreshToken: SPOTIFYrefreshToken,
//               accessToken: SPOTIFYaccessToken,
//               expiresIn: SPOTIFYexpiresIn,
//             });
//           }
//         } catch (error) {
//           next(error);
//         }
//       }
//     }
//   } catch (error) {
//     next(error);
//   }
// });
// authRoutes.post("/register", async (req, res, next) => {
//   const code = req.body.code;
//   const spotifyApi = await new SpotifyWebApi({
//     redirectUri: process.env.REDIRECT_URI,
//     clientId: process.env.CLIENT_ID,
//     clientSecret: process.env.CLIENT_SECRET,
//   });
//   // console.log(code);
//   const data = await spotifyApi.authorizationCodeGrant(code);
//   const accessToken = data.body.access_token;
//   const refreshToken = data.body.refresh_token;
//   const expiresIn = data.body.expires_in;
//   if (data) {
//     await spotifyApi.setAccessToken(accessToken);
//     const user = await spotifyApi.getMe();
//     const spotiUser = user.body;
//     console.log(spotiUser);
//     const generatedUser = {
//       username: spotiUser.display_name,
//       password: spotiUser.id,
//       profilePic: spotiUser.images[0],
//     };
//     try {
//       const newUser = await UserModel.create(generatedUser);
//       if (newUser) {
//         const tokens = await authenticateUser(newUser);

//         const access_token = await jwt.sign(
//           { sub: newUser._id },
//           process.env.JWT_ACCESS_TOKEN
//         );
//         res
//           .cookie("accessToken", tokens.accessToken, {
//             httpOnly: true,
//             sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
//             secure: process.env.NODE_ENV === "production" ? true : false,
//           })
//           .cookie("refreshToken", tokens.refreshToken, {
//             httpOnly: true,
//             sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
//             secure: process.env.NODE_ENV === "production" ? true : false,
//           })
//           .send({ message: "logged in" });
//       }
//     } catch (error) {
//       // console.log(error);
//       next(error);
//     }
//   }
// });
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

authRoutes.post("/login", loginWare, async (req, res, next) => {
  try {
    if (req.user) {
      const user = req.user;
      const tokens = await authenticateUser(user);
      user.refreshToken = [...user.refreshToken, tokens.refreshToken];
      user.status.presence = "online";
      user.save();
      res
        .cookie("accessToken", tokens.accessToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
          secure: process.env.NODE_ENV === "production" ? true : false,
        })
        .cookie("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
          secure: process.env.NODE_ENV === "production" ? true : false,
          path: "/refreshToken",
        })
        .send({ message: "logged in" });
    } else {
      res.status(404).send({ message: "No user found!" });
    }
  } catch (error) {
    // console.log(error);
    next(error);
  }
});

authRoutes.post("/logout", authorizeUser, async (req, res, next) => {
  console.log(req.user);
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

authRoutes.get("/me", authorizeUser, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

authRoutes.put("/me", authorizeUser, async (req, res, next) => {
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

authRoutes.get("/:id", authorizeUser, async (req, res, next) => {
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

authRoutes.put("/:id", authorizeUser, async (req, res, next) => {
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
