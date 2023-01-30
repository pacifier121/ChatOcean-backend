const passport = require('passport');
const GoogleStategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
require('dotenv').config();

module.exports = (passport) => {
    passport.use(new GoogleStategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback' 
    }, 
    async (accesToken, refreshToken, profile, done) => {
        const newUser = {
            googleId: profile.id,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            avatar: profile.photos[0]
        }
        try {
           let user = await User.findOne({ googleId: newUser.googleId });
           if (user) {
                done(null, user);
           }
           done(null, false, { err: "User not found" });
        } catch (err) {
           console.log(err); 
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user);
    })
    passport.deserializeUser((user, done) => {
        done(null, user);
    })
}