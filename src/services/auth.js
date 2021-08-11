import { Router } from "express";

import passport from "../utils/passport.js";

import { spotify_scopes } from "../utils/strategies/spotify.js";

import spotifyApi from "../utils/api.js";
import UserModel from "../routes/users/schema.js";
import { authenticateUser, authorizeUser } from "../middlewares/jwt.js";
import { spotifyAuthentication } from "../middlewares/spotifyAuthentication.js";
//TODO : state?.user?.spotifyTokens?.access_token;
// set the token on the user object to retrive it with the above strategy
const spotifyRoutes = Router();

spotifyRoutes.get(
  "/login",
  passport.authenticate("spotify", {
    scope: spotify_scopes,
  })
);

spotifyRoutes.get(
  "/login/callback",
  passport.authenticate("spotify"),
  async (req, res, next) => {
    try {
      // here I got the users spotify token
      const { accessToken, refreshToken, expires_in, tokens } = req.user;
      // TODO : check if the token is expired
      res.cookie("spotifyAccessToken", accessToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
        secure: process.env.NODE_ENV === "production" ? true : false,
      });
      res.cookie("spotifyRefreshToken", refreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
        secure: process.env.NODE_ENV === "production" ? true : false,
      });
      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
        secure: process.env.NODE_ENV === "production" ? true : false,
      });
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", //set to lax when deploy
        secure: process.env.NODE_ENV === "production" ? true : false,
      });
      res.redirect("http://localhost:3000/discover");
      //
    } catch (error) {
      console.log(error);
      res.status(400).send({ error: error.message });
    }
  }
);

spotifyRoutes.get(
  "/upload/:playlistID/:image",
  authorizeUser,
  async (req, res, next) => {
    try {
      const data = await spotifyApi.uploadCustomPlaylistCoverImage(
        req.params.playlistId,
        req.params.image
      );
      res.send({ message: "Playlsit cover image uploaded!" }, data);
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.post(
  "/followed/artists",
  authorizeUser,
  async (req, res, next) => {
    try {
      const data = await spotifyApi.getFollowedArtists({ limit: 1 });

      res.send({ message: "Followed artists retrieved!" }, data);
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.post(
  "/follow/:artistID",
  authorizeUser,
  async (req, res, next) => {
    try {
      const data = await spotifyApi.followArtists([
        "2hazSY4Ef3aB9ATXW7F5w3",
        "6J6yx1t3nwIDyPXk5xa7O8",
      ]);
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.get(
  "/follow/:username",
  authorizeUser,
  async (req, res, next) => {
    try {
      const data = await spotifyApi.followUsers([req.params.username]);
      console.log(data);
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.post(
  "/unfollow/artist",
  authorizeUser,
  async (req, res, next) => {
    try {
    } catch (error) {}
  }
);
spotifyRoutes.post("/unfollow/user", authorizeUser, async (req, res, next) => {
  try {
  } catch (error) {}
});
spotifyRoutes.post(
  "/search/user/following",
  authorizeUser,
  async (req, res, next) => {
    try {
    } catch (error) {}
  }
);

spotifyRoutes.post(
  "/new/relases",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getNewReleases({
        limit: 5,
        offset: 0,
        country: req.user.country,
      });

      if (data.statusCode === 200) {
        console.log(data);
        res.send(data.body);
      } else {
        const error = new Error("Something went wrong!");
        next(error);
      }
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.get("/categories", authorizeUser, async (req, res, next) => {
  try {
  } catch (error) {}
});
spotifyRoutes.get("/seeds", authorizeUser, async (req, res, next) => {
  try {
  } catch (error) {}
});

spotifyRoutes.post(
  "/get/raccomanded",
  authorizeUser,
  async (req, res, next) => {
    //seed needed
    try {
    } catch (error) {}
  }
);
spotifyRoutes.get("/recently-played", authorizeUser, async (req, res, next) => {
  try {
  } catch (error) {}
});
spotifyRoutes.get(
  "/currently-playing",
  authorizeUser,
  async (req, res, next) => {
    try {
    } catch (error) {}
  }
);
spotifyRoutes.get(
  "/user/top-artists",
  authorizeUser,
  async (req, res, next) => {
    try {
    } catch (error) {}
  }
);
spotifyRoutes.get("/user/top-tracks", authorizeUser, async (req, res, next) => {
  try {
  } catch (error) {}
});
export default spotifyRoutes;
