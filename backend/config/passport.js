const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Serialize user into session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "http://localhost:5000/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      // User authenticated successfully
      const user = {
        id: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        picture: profile.photos[0]?.value,
      };
      return done(null, user);
    }
  )
);

module.exports = passport;
