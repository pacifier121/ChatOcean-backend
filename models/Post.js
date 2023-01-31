const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    desc: {
        type: String,
    },
    content: {
        type: Array,
        default: []
    },
    likes: {
        type: Array,
        default: []
    },
    comments: {
        type: Array,
        default: []
    }
}, {
    timestamps: true
})


module.exports = mongoose.model('Post', PostSchema);
