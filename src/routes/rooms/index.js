import express from "express";
import { authorizeUser } from "../../middlewares/jwt.js";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import RoomSchema from "./schema.js";
import UserSchema from "../users/schema.js";
import MessageSchema from "../messages/schema.js";

import { v2 as cloudinary } from "cloudinary";
import sgMail from "@sendgrid/mail";

import { v4 as uid } from "uuid";

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    allowed_formats: ["png", "jpg", "gif", "bmp", "jpeg"],
    folder: "OurMusicImgs",
    public_id: (req, file) => req.user._id + uid.toString(),
    // transformation: [
    //   { width: 600, height: 600, gravity: "face", crop: "fill" },
    // ],
  },
});
export const CloudinaryMulter = multer({
  storage: cloudinaryStorage,
});

const roomRoute = express.Router();

//TODO: Playlist managemement

//Create room when follow a user
roomRoute.post("/:participantId", authorizeUser, async (req, res, next) => {
  console.log(req.user._id);
  try {
    const newRoom = await new RoomSchema({
      name: req.body.name,
      participants: [req.params.participantId, req.user._id],
    });

    const newRoomCreated = await newRoom.save();
    newRoomCreated.participants.forEach(async (participant) => {
      await UserSchema.findOneAndUpdate(
        { _id: participant._id },
        {
          $push: {
            rooms: newRoomCreated._id,
          },
        },
        { runValidators: true, new: true }
      );
    });
    res.status(201).send({ message: newRoomCreated._id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET ALL ROOMS
roomRoute.get("/", authorizeUser, async (req, res, next) => {
  try {
    const allRooms = await RoomSchema.find().populate("participants");
    res.send(allRooms);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//GET ROOM BY ID
roomRoute.get("/:id", authorizeUser, async (req, res, next) => {
  try {
    const singleRoom = await RoomSchema.findById(req.params.id);
    if (singleRoom) {
      res.send(singleRoom);
    } else {
      res.status(404).send({ message: "Could not find a room with this id" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

roomRoute.post(
  "/text-to/:id",
  authorizeUser,
  CloudinaryMulter.single("messagePic"),
  // CloudinaryMulter.multiple("messagePics"),
  async (req, res, next) => {
    try {
      const newMessage = new MessageSchema({
        roomId: req.params.id,
        senderId: req.user._id,
        text: req.body.text,
        messagePic: req.file?.path ? req.file.path : "",
      });
      const message = { ...newMessage.toObject() };
      const room = await RoomSchema.findByIdAndUpdate(
        req.params.id,
        {
          $push: {
            chatHistory: { ...message },
          },
        },
        {
          runValidators: true,
          new: true,
        }
      );
      res.status(200).send(room);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//ADD USER TO ROOM AND VIS-VERSA
roomRoute.put(
  "/:roomId/add-user/:userId",
  authorizeUser,
  async (req, res, next) => {
    console.log(req.user._id);
    console.log(req.params.userId);
    try {
      if (req.user._id.toString() === req.params.userId) {
        await RoomSchema.addUserToRoom(req.params.userId, req.params.roomId);
        await UserSchema.addRoomToUser(req.params.userId, req.params.roomId);
        res.send({ message: "authorized" });
      } else {
        res.status(401).send({ message: "This is not your account!" });
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

export default roomRoute;
