import express from "express";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";

import { Server } from "socket.io";
import { createServer } from "http";

import userRoutes from "./models/users/index.js";
import authRoutes from "./guard/authentication.js";

import cors from "cors";
import createSocketServer from "./socket/index.js";
import verifyToken from "./middlewares/jwt.js";
import contactsRoute from "./models/rooms/index.js";
const app = express();

const httpServer = createServer(app);

createSocketServer(httpServer);

app.use(cors());

app.use(express.json());

// routes
app.use("/auth", authRoutes);
app.use("/users", verifyToken, userRoutes);
app.use("/contacts", contactsRoute)

const PORT = process.env.PORT || 7000;

mongoose
  .connect(process.env.MONGO_ATLAS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(
    httpServer.listen(
      PORT,
      () =>
        console.log(`bear grills running away from ${PORT} bears D:`) +
        console.table(listEndpoints(app))
    )
  );
