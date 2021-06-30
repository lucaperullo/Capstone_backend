import express from "express";
import listEndpoints from "express-list-endpoints";
import mongoose from "mongoose";

import { Server } from "socket.io";
import { createServer } from "http";

import userRoutes from "./models/users/index.js";
import authRoutes from "./guard/authentication.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import createSocketServer from "./socket/index.js";

import roomsRoute from "./models/rooms/index.js";
import {
  notFoundErrorHandler,
  badRequestErrorHandler,
  catchAllErrorHandler,
  unauthorizedErrorHandler,
  forbiddenErrorHandler,
} from "./middlewares/errorHandler.js";

const app = express();

const httpServer = createServer(app);

createSocketServer(httpServer);
const corsOptions = {
  origin: ["http://localhost:3000", "https://capstone-tau.vercel.app"],
  credentials: true,
  // exposedHeaders: ["set-cookie"],
};
// app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());
// routes
app.use("/", authRoutes);
app.use("/users", userRoutes);
app.use("/rooms", roomsRoute);

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
