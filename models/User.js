const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    googleId: {
        type: String,
    },
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
    },
    coverImg: {
        type: String,
    },
    dateOfBirth: {
        type: String,
    },
    from: {
        type: String
    },
    followers: {
        type: Array,
        default: []
    },
    followings: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})


module.exports = mongoose.model('User', UserSchema);