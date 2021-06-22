import jwt from "jsonwebtoken";
import express from "express";
import UserSchema from "../models/user/schema.js";

const authRoutes = express.Router();

authRoutes.post("/register", async (req, res, next) => {
  try {
    const newUser = await UserSchema.create(req.body);
    if (newUser) {
      const username = req.body.username;
      const email = req.body.email;
      const access_token = await jwt.sign(
        { sub: newUser._id },
        process.env.JWT_ACCESS_TOKEN
      );
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

authRoutes.post("login", async (req, res, next) => {
  try {
    const user = await UserSchema.find({
      $and: [
        {
          $or: [{ username: req.body.username }, { email: req.body.username }],
        },
        { password: req.body.password },
      ],
    });
    if (user.length === 1) {
      const access_token = await jwt.sign(
        { sub: user },
        process.env.JWT_ACCESS_TOKEN
      );
      return res.json({
        status: true,
        message: "login success",
        data: { access_token },
      });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default authRoutes;
