const Post = require('../models/Post');

const router = require('express').Router();

// Get user posts
router.get('/post', async(req, res) => {
    try {
        const posts = await Post.find({ userId: req.query.userId });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err); 
    }
})


// Post a post
router.post('/post', async(req, res) => {
    try {
        const newPost = new Post(req.body); 
        await newPost.save();        
        
        res.status(200).json(newPost);
    } catch (err) {
        console.log(err); 
        res.status(500).json(err);
    }
})



module.exports = router;
