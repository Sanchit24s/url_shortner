const passport = require("passport");
const userModel = require("../models/userModel");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "http://localhost:3000/auth/google/callback",
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const existingUser = await userModel.findOne({ googleId: profile.id });
                if (existingUser) {
                    return done(null, existingUser);
                }

                const newUser = new userModel({
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    profilePicture: profile.photos[0].value,
                });
                await newUser.save();
                done(null, newUser);
            } catch (error) {
                done(error, null);
            }
        }
    )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
    try {
        const user = await userModel.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});
