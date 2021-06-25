import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import UserSchema from "../models/users/schema.js";

export const authorizeUser = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;

    const decoded = await verifyAccessToken(accessToken);
    const user = await UserSchema.findById(decoded._id)
      .populate({
        path: "rooms",

        populate: {
          path: "participants",
        },
      })
      .populate({
        path: "rooms",

        populate: {
          path: "chatHistory",
        },
      })
      .exec();

    if (!user) {
      throw new Error();
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    const err = new Error("Please Authenticate!");
    next(err);
  }
};

export const authenticateUser = async (user) => {
  try {
    const newAccessToken = await generateJWTAccess({ _id: user._id });
    const newRefreshToken = await generateJWTRefresh({ _id: user._id });
    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

const generateJWTAccess = async (payload) => {
  try {
    const accessToken = await jwt.sign(payload, process.env.JWT_ACCESS_TOKEN, {
      expiresIn: "1d",
    });
    if (!accessToken) {
      throw new Error();
    }
    return accessToken;
  } catch (error) {
    console.log(error);
    const err = new Error("Failed to generate access token");
    next(err);
  }
};

const generateJWTRefresh = async (payload) => {
  try {
    const refreshToken = await jwt.sign(
      payload,
      process.env.JWT_REFRESH_SECRET,
      {
        expiresIn: "7d",
      }
    );
    if (!refreshToken) {
      throw new Error();
    }
    return refreshToken;
  } catch (error) {
    console.log(error);
    const err = new Error("Failed to generate access token");
    next(err);
  }
};

const verifyAccessToken = async (token) => {
  try {
    const decodedToken = await jwt.verify(token, process.env.JWT_ACCESS_TOKEN);
    if (!decodedToken) {
      throw new Error();
    }
    return decodedToken;
  } catch (error) {
    console.log(error);
    throw new Error("Failed to generate access token");
  }
};

const verifyRefreshToken = async (token) => {
  try {
    const decodedToken = await jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );
    if (!decodedToken) {
      throw new Error();
    }
    return decodedToken;
  } catch (error) {
    console.log(error);
    const err = new Error("Failed to generate access token");
    next(err);
  }
};
