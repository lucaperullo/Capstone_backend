
import { v2 as cloudinary } from "cloudinary";


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINDARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});
