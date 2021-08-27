import express from "express";
import mongoose from "mongoose";
import path from "path";
import crypto from "crypto";
import GridFsStorage from "multer-gridf-storage";
import multer from "multer";

const fileRouter = express.Router();

let gfs;
mongoose.connection.once("open", () => {
  gfs = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
    bucketName: "files",
  });
});

const storage = new GridFsStorage({
  url: process.env.MONGO_ATLAS,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "files",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({
  storage,
});

fileRouter.post("/upload", upload.single("file"), (req, res) => {
  res.send({ message: req.file.filename });
});

fileRouter.get("/", (req, res) => {
  if (!gfs) {
    console.log("some error occured, check connection to db");
    res.send("some error occured, check connection to db");
    process.exit(0);
  }
  gfs.find().toArray((err, files) => {
    // check if files
    if (!files || files.length === 0) {
      return res.send({ message: "failure" });
    } else {
      const f = files
        .map((file) => {
          if (
            file.contentType === "image/png" ||
            //   file.contentType === "image/gif" ||
            file.contentType === "image/jpeg"
          ) {
            file.isImage = true;
          } else {
            file.isImage = false;
          }
          return file;
        })
        .sort((a, b) => {
          return (
            new Date(b["uploadDate"]).getTime() -
            new Date(a["uploadDate"]).getTime()
          );
        });

      return res.send(files);
    }

    // return res.json(files);
  });
});

fileRouter.get("/:filename", (req, res) => {
  const file = gfs
    .find({
      filename: req.params.filename,
    })
    .toArray((err, files) => {
      if (!files || files.length === 0) {
        return res.status(404).json({
          err: "no files exist",
        });
      }
      res.setHeader(
        "Content-Disposition",
        `attachment; filename=${req.params.filename}`
      );
      gfs.openDownloadStreamByName(req.params.filename).pipe(res);
    });
});
