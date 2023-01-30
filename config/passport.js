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
            avatar: profile.photos[0].value
        }
        console.log(profile);
        try {
           let user = await User.findOne({ googleId: newUser.googleId });
           if (user) {
                done(null, user);
           }
        //    done(null, false, { err: "User not found" });
            const brandNewUser = new User({
                username: newUser.firstName + Date.now(),
                email: newUser.firstName + Date.now() + '@temp.com',
                password: newUser.firstName + Date.now() + 'pass',
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                avatar: newUser.avatar
            })
            await brandNewUser.save();
            done(null, brandNewUser);
        } catch (err) {
           console.log(err); 
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id);
    })
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => done(err, user));
    })
}