// import express from "express";
// import SpotifyWebApi from "spotify-web-api-node";

// const spotifyRoute = express();

// spotifyRoute.post("/login", async (req, res, next) => {
//   const code = req.body.code;
//   const spotifyApi = new SpotifyWebApi({
//     redirectUri: process.env.FRONT_DISCOVER_URI,
//     cliendId: process.env.SPOTIFY_CLIENT_ID,
//     clientSecret: process.env.SPOTIFY_CLIENT_SEC,
//   });
//   spotifyApi
//     .authorizationCodeGrant(code)
//     .then((data) => {
//       res.json({
//         accessToken: data.body.access_token,
//         refreshToken: data.body.refresh_token,
//         expiresIn: data.body.expires_in,
//       });
//     })
//     .catch(() => {
//       res.sendStatus(400);
//     });
// });
// //   try {
// //     const data = await spotifyApi.authorizationCodeGrant(code);
// //     const response = await data.json();
// //     res.status(200).send(response);
// //   } catch (error) {
// //     next(error);
// //   }

// export default spotifyRoute;
