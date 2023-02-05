const mongoose = require('mongoose');

const NotificationSchema = mongoose.Schema({
    action: {
        type: String,   
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    postId: {
        type: String
    },
    image: {
        type: String,
    },
    read: {
        type: Boolean,
        default: false
    },
    desc: {
        type: String
    },
    username: {
        // Person who liked the post
        type: String
    }
}, {
    timestamps: true
})


module.exports = mongoose.model('Notification', NotificationSchema);


