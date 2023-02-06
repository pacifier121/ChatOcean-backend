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
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    accountType: {
        type: String,
        enum: ['public', 'private'],
        required: true,
        default: 'public'
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
    },
    pendingRequests: {
        type: Array,
        default: []
    },
    favoritePosts: {
        type: Array,
        default: []
    },
    isAdmin: {
        type: Boolean,
    }
}, {
    timestamps: true
})


module.exports = mongoose.model('User', UserSchema);