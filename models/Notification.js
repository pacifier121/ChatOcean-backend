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
    }
}, {
    timestamps: true
})


module.exports = mongoose.model('Notification', NotificationSchema);


