import { Strategy as SpotifyStrategy } from "passport-spotify";
import api from "../api.js";

import UserModel from "../../routes/users/schema.js";
import { authenticateUser } from "../../middlewares/jwt.js";
const { CLIENT_ID, CLIENT_SECRET, CALLBACK_URL } = process.env;

export const spotify_scopes = [
  "ugc-image-upload",
  "user-read-recently-played",
  "user-read-playback-state",
  "user-top-read",
  "playlist-modify-public",
  "user-modify-playback-state",
  "playlist-modify-private",
  "user-follow-modify",
  "user-read-currently-playing",
  "user-follow-read",
  "user-library-modify",
  "user-read-playback-position",
  "user-read-email",
  "playlist-read-private",
  "user-read-private",
  "user-library-read",
  "playlist-read-collaborative",
  "streaming",
];

const spotifyApi = new SpotifyStrategy(
  {
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: CALLBACK_URL,
  },
  async function (accessToken, refreshToken, expires_in, profile, done) {
    /**
     *
     *   check if user is exist in your database by querying profile.id
     *   if exists find user and update users spotify token
     *      generate jwt token for user and pass to done function
     *      done(null, { tokens ...user });
     *
     *  else create user and pass accessToken to done function
     *     add user's spotify accessToken  and generate jwt token for user
     *     done(null, { tokens, ...user });
     */
    try {
      api.setAccessToken(accessToken);

      const playlistsData = await api.getUserPlaylists(profile.username);
      const playlists = playlistsData?.body?.items;
      console.log(profile);
      if (profile) {
        const proPic = profile.photos[0]?.value;
        const generatedUser = {
          spotifyId: profile.id,
          username: profile.displayName,
          country: profile.country,
          password: profile.id,
          profilePic: proPic !== undefined ? profile.photos[0]?.value : "",
          spotifyTokens: {
            access_token: accessToken,
            refresh_token: refreshToken,
            expires_in: expires_in,
          },

          playlists: {
            userPlaylists: {
              items: playlists,
            },
            next: playlistsData.body.next,
            previous: playlistsData.body.previous,
            total: playlistsData.body.total,
          },
        };

        const existingUser = await UserModel.findOne({
          username: profile.displayName,
        });
        if (existingUser) {
          const tokens = await authenticateUser(existingUser);
          done(null, {
            accessToken,
            refreshToken,
            expires_in,
            profile,
            tokens,
          });
        } else {
          const newUser = await UserModel.create(generatedUser);
          const tokens = await authenticateUser(newUser);

          done(null, {
            accessToken,
            refreshToken,
            expires_in,
            profile,
            tokens,
          });
        }
      }
    } catch (error) {
      console.log(error);
    }
    // here I'm passing the user's spotify token to next function to use in callback!
    // done(null, { accessToken, refreshToken, expires_in, profile, tokens });
  }
);

export default spotifyApi;
