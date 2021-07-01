//TODO: music routes
//TODO: generate music history on new user
//TODO: update music history when a user is listening to a song
//TODO: create a new playlist CRUD
import express from "express";
import MessageModel from "../messages/schema.js";
import { authorizeUser } from "../../middlewares/jwt.js";
import q2m from "query-to-mongo";

const messageRoutes = express.Router();

messageRoutes.get("/:roomId", authorizeUser, async (req, res, next) => {
  try {
    const messages = await MessageModel.find({
      roomId: req.params.roomId,
    }).populate(
      "senderId",
      "-password -email -phone -contacts -refreshToken -rooms -bio"
    );
    const query = q2m(req.query);
    const total = await MessageModel.countDocuments({
      roomId: req.params.roomId,
    });
    const links = query.links("/messages", total);
    if (messages) {
      res.status(200).send({ messages, total, links });
    } else {
      const error = new Error("room not found");
      next(error);
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default messageRoutes;
