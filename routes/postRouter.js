const Post = require('../models/Post');
const { removeFields } = require('../constants/constants');
const User = require('../models/User');

const router = require('express').Router();


// Get a post
router.get("/post", async(req, res) => {
    try {
        let post = await Post.findById(req.query.postId);
        if (!post) return res.status(404).json({ err: "Post not found" })
        
        res.status(200).json(post);
    } catch (err) {
        console.log(err);
        res.status(500).json(err); 
    }
})


// Get post owner
router.get('/owner', async(req, res) => {
    try {
        let post = await Post.findById(req.query.postId);
        if (!post) return res.status(404).json({ err: "Post not found" })
        
        let user = await User.findById(post.userId);
        user = removeFields(user, ['email, password']);
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
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
