const passport = require('passport');
const GoogleStategy = require('passport-google-oauth20').Strategy;
require('dotenv').config();

module.exports = (passport) => {
    passport.use(new GoogleStategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback' 
    }, 
    async (accesToken, refreshToken, profile, done) => {
        done(null, profile);
    }))

    passport.serializeUser((user, done) => {
        done(null, user);
    })
    passport.deserializeUser((user, done) => {
        done(null, user);
    })
}