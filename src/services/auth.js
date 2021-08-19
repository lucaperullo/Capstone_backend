import { Router } from "express";

import passport from "../utils/passport.js";

import { spotify_scopes } from "../utils/strategies/spotify.js";

import { authenticateUser, authorizeUser } from "../middlewares/jwt.js";
import { spotifyAuthentication } from "../middlewares/spotifyAuthentication.js";

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
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.uploadCustomPlaylistCoverImage(
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
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getFollowedArtists({ limit: 1 });

      res.send({ message: "Followed artists retrieved!" }, data);
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.post(
  "/follow/:artistID",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.followArtists([
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
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.followUsers([req.params.username]);
      console.log(data);
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.post(
  "/unfollow/artist",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
    } catch (error) {}
  }
);
spotifyRoutes.post(
  "/unfollow/user",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
    } catch (error) {}
  }
);
spotifyRoutes.post(
  "/search/user/following",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
    } catch (error) {}
  }
);
spotifyRoutes.post(
  "/new/releases",
  authorizeUser,
  spotifyAuthentication,

  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getNewReleases({
        limit: 4,
        offset: 0,
        country: req.user.country,
      });

      if (data.statusCode === 200) {
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
spotifyRoutes.post(
  "/view-more-releases",
  authorizeUser,
  spotifyAuthentication,

  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getNewReleases({
        limit: 46,
        offset: 0,
        country: req.user.country,
      });

      if (data.statusCode === 200) {
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
spotifyRoutes.post(
  "/categories",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getCategories({
        limit: 4,
        offset: 0,
        country: req.user.country,
      });
      if (data.statusCode === 200) {
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
spotifyRoutes.post(
  "/view-more-categories",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getCategories({
        limit: 50,
        offset: 0,
        country: req.user.country,
      });
      if (data.statusCode === 200) {
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
spotifyRoutes.get(
  "/category/:name",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getPlaylistsForCategory(
        req.params.name,
        {
          country: req.user.country,
          offset: 0,
        }
      );
      if (data.statusCode === 200) {
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
spotifyRoutes.get(
  "/playlist/:id/tracks",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getPlaylistTracks(req.params.id, {
        offset: 1,
        fields: "items",
      });
      if (data.statusCode === 200) {
        res.send(data.body);
      }
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.get(
  "/follow/:username",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.followUsers([req.params.username]);
      if (data.statusCode === 200) {
        res.send(data);
      }
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.get(
  "/unfollow/:username",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.unfollowUsers([req.params.username]);
      if (data.statusCode === 200) {
        res.send(data);
      }
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.get(
  "/savedTracks",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getMySavedTracks({
        offset: 1,
      });
      if (data.statusCode === 200) {
        res.send(data);
      }
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.get(
  "/unlikeTrack/:trackID",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.removeFromMySavedTracks([
        req.params.trackID,
      ]);
      if (data.statusCode === 200) {
        res.send(data);
      }
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.get(
  "/likeTrack/:trackID",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.addToMySavedTracks([
        req.params.trackID,
      ]);
      if (data.statusCode === 200) {
        res.send(data);
      }
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.get(
  "/recentlyPlayed",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getMyRecentlyPlayedTracks({
        limit: 50,
        offset: 0,
      });
      console.log(data);
      if (data.statusCode === 200) {
        res.send(data);
      }
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);

spotifyRoutes.get(
  "/seeds",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
    } catch (error) {}
  }
);

spotifyRoutes.get(
  "/raccomanded",
  authorizeUser,
  spotifyAuthentication,

  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getMyTopTracks();
      if (data.statusCode === 200) {
        res.send(data.body.items);
      }
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.get(
  "/recently-played",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
      const data = await req.spotifyApi.getMyRecentlyPlayedTracks({
        limit: 50,
        offset: 0,
      });

      if (data.statusCode === 200) {
        res.send(data.body.items);
      }
    } catch (error) {
      console.log("Something went wrong!", error);
    }
  }
);
spotifyRoutes.get(
  "/currently-playing",
  authorizeUser,
  spotifyAuthentication,

  async (req, res, next) => {
    try {
    } catch (error) {}
  }
);
spotifyRoutes.get(
  "/user/top-artists",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
    } catch (error) {}
  }
);
spotifyRoutes.get(
  "/user/top-tracks",
  authorizeUser,
  spotifyAuthentication,
  async (req, res, next) => {
    try {
    } catch (error) {}
  }
);
export default spotifyRoutes;
