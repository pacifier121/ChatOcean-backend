const mongoose = require('mongoose');

const ChatSchema = mongoose.Schema({
    type: {
        type: String,   
        default: 'person'
    },
    members: {
        type: Array,
        required: true
    },
    content: {
        type: Array, 
        default: []
    }
}, {
    timestamps: true
})


module.exports = mongoose.model('Chat', ChatSchema);

