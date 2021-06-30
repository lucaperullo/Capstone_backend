import jwt from "jsonwebtoken";
import express from "express";
import UserModel from "../models/users/schema.js";
import {
  authenticateUser,
  authorizeUser,
  refreshToken,
} from "../middlewares/jwt.js";
import { loginWare } from "../middlewares/loginWare.js";

const authRoutes = express.Router();

authRoutes.post("/register", async (req, res, next) => {
  try {
    const newUser = await UserModel.create(req.body);
    if (newUser) {
      const tokens = await authenticateUser(newUser);
      const username = req.body.username;
      const email = req.body.email;
      const access_token = await jwt.sign(
        { sub: newUser._id },
        process.env.JWT_ACCESS_TOKEN
      );
      res
        .cookie("accessToken", tokens.accessToken, {
          httpOnly: true,
          secure: false, //set to true when deploy
          sameSite: "lax", //set to lax when deploy
        })
        .cookie("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          secure: false, //set to true when deploy
          sameSite: "lax", //set to none when deploy
        })
        .send({ message: "logged in" });
      res.status(201).send({
        message: `User created with this ID => ${newUser._id}`,
        access_token: `${access_token}`,
      });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
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
        });
        res.cookie("refreshToken", newTokens.refreshToken, {
          httpOnly: true,
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

// authRoutes.post("login", async (req, res, next) => {
//   try {
//     const user = await UserModel.find({
//       $and: [
//         {
//           $or: [{ username: req.body.username }, { email: req.body.username }],
//         },
//         { password: req.body.password },
//       ],
//     });
//     if (user.length === 1) {
//       const access_token = await jwt.sign(
//         { sub: user },
//         process.env.JWT_ACCESS_TOKEN
//       );
//       return res.json({
//         status: true,
//         message: "login success",
//         data: { access_token },
//       });
//     } else {
//       res.status(404).send("User not found");
//     }
//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// });
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
          secure: false, //set to true when deploy
          sameSite: "lax", //set to none when deploy
        })
        .cookie("refreshToken", tokens.refreshToken, {
          httpOnly: true,
          secure: false, //set to true when deploy
          sameSite: "lax", //set to none when deploy
          path: "/refreshToken",
        })
        .send({ message: "logged in" });
    } else {
      res.status(404).send({ message: "No user found!" });
    }
  } catch (error) {
    console.log(error);
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
      }).populate("rooms");
      res.send(filteredUsers);
    } else {
      const allUsers = await UserModel.find()
        .populate("rooms")
        .populate({
          path: "rooms",

          populate: {
            path: "participants",
          },
        })
        .exec();
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
