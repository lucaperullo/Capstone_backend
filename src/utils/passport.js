import passport from "passport";

import spotify from "./strategies/spotify.js";

passport.use(spotify);

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(err, user);
});

export default passport;
