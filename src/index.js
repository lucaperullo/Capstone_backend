import express from "express";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";
import passport from "./utils/passport.js";
import { Server } from "socket.io";
import { createServer } from "http";

import userRoutes from "./routes/users/index.js";
import authRoutes from "./guard/authentication.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import createSocketServer from "./chat/index.js";

import roomsRoute from "./routes/rooms/index.js";
import {
  notFoundErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler,
} from "./middlewares/errorHandler.js";
import messageRoutes from "./routes/messages/index.js";
import spotifyRoutes from "./services/auth.js";

const app = express();

const httpServer = createServer(app);

createSocketServer(httpServer);
const corsOptions = {
  origin: [
    "http://localhost",
    "http://localhost:3000",
    "https://ourmusic.vercel.app",
    "https://ourmusic.vercel.app/discover",
    "https://capstonebe.herokuapp.com",
  ],
  credentials: true,
  // exposedHeaders: ["set-cookie"],
};
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cors(corsOptions));
app.use(passport.initialize());

app.use(express.json());
app.use(cookieParser());

// routes

app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/messages", messageRoutes);
app.use("/rooms", roomsRoute);
app.use("/spotify", spotifyRoutes);
app.use(badRequestErrorHandler);
app.use(notFoundErrorHandler);
app.use(unauthorizedErrorHandler);
app.use(forbiddenErrorHandler);
app.use(catchAllErrorHandler);

const PORT = process.env.PORT || 7000;

mongoose
  .connect(process.env.MONGO_ATLAS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // createIndexes: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(
    httpServer.listen(
      PORT,
      () =>
        console.log(`bear grills running away from ${PORT} bears D:`) +
        console.table(listEndpoints(app))
    )
  );
