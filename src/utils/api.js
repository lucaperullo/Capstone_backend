import SpotifyWebApi from "spotify-web-api-node";

const { CLIENT_ID, CLIENT_SECRET, CALLBACK_URL } = process.env;

const spotifyApi = new SpotifyWebApi({
  clientId: CLIENT_ID,
  clientSecret: CLIENT_SECRET,
  redirectUri: CALLBACK_URL,
});

export default spotifyApi;
