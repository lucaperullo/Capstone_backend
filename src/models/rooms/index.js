import express from "express";
import { authorizeUser } from "../../middlewares/jwt.js";

import RoomSchema from "./schema.js";
import UserSchema from "../users/schema.js";
import MessageSchema from "../text/schema.js";

import sgMail from "@sendgrid/mail";

const roomRoute = express.Router();

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
    const allRooms = await RoomSchema.find().populate("chatHistory");
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

roomRoute.post("/text-to/:id", authorizeUser, async (req, res, next) => {
  try {
    const newMessage = new MessageSchema({
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
  }
});

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

//SEND JOIN EMAIL
// roomRoute.post(
//   "/addrequest/:roomId",
//   authorizeUser,
//   async (req, res, next) => {
//     try {
//       let requestedUser = await UserSchema.findOne({ email: req.body.email });
//       if (requestedUser) {
//         sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//         const msg = {
//           to: req.body.email,
//           from: "thepoopatroopa@gmail.com",
//           subject: "Room Request",
//           text: "You have been invited",
//           html: `<strong>You have been invited to a new room. <a href='https://capstone-fe.vercel.app/room/${req.params.roomId}?join=true'>Click here<a/> to join!</strong>`,
//         };
//         await sgMail.send(msg);
//         res.send({ message: "Invite sent!" });
//       } else {
//         res.send({ message: "No User with this email found!" });
//       }
//     } catch (error) {
//       console.log(error);
//       next(error);
//     }
//   }
// );
export default roomRoute;
