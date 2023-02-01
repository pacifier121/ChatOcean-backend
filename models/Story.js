const mongoose = require('mongoose');

const StorySchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
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


module.exports = mongoose.model('Story', StorySchema);

