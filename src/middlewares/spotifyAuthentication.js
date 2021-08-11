import spotifyApi from "../utils/api.js";

export const spotifyAuthentication = async (req, res, next) => {
  try {
    const accessToken = req.cookies.spotifyAccessToken;
    const refreshToken = req.cookies.spotifyRefreshToken;

    spotifyApi.setAccessToken(accessToken);
    spotifyApi.setRefreshToken(refreshToken);

    const user = await spotifyApi.getMe();
    if (user.statusCode === 401 && !req.refreshed) {
      const tokens = await spotifyApi.refreshAccessToken();
      console.log(tokens);
      res.cookie("spotifyAccessToken", tokens.access_token);
      res.cookie("spotifyRefreshToken", tokens.refresh_token);
      req.cookies.spotifyAccessToken = tokens.access_token;
      req.cookies.refreshAccessToken = tokens.refresh_token;
      req.refreshed = true;
      spotifyAuthentication(req, res, next);
      return;
    }

    if (!user) {
      throw new Error("idk");
    }
    req.spotifyApi = spotifyApi;
    next();
  } catch (error) {
    console.log(error);
    const err = new Error("Please Authenticate!");
    next(err);
  }
};
