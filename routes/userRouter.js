const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { removeFields } = require('../constants/constants');

// Get user
router.get('/user', async(req, res) => {
    try {
        const { username, userId } = req.query;
        let user = null;
        if (userId){
            user = await User.findById(userId);
        } else if (username) {
            user = await User.findOne({username});
        }
        if (!user) return res.status(404).json({ err: 'No such user found'});
        
        user = removeFields(user, ['password', 'email']);
        res.status(200).json(user);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})

// Update user
router.put('/user', async(req, res) => {
    try {
        let user = await User.findByIdAndUpdate(req.body.userId, req.body.updates);

        if (!user) return res.status(404).json({ err: 'No such user found'});
        res.status(200).json({ msg: "Updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})


// Get user posts
router.get('/posts/:userId', async(req, res) => {
    try {
        const posts = await Post.find({ userId: req.params.userId });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json(err); 
    }
})

// Get user timeline posts
router.get('/timeline', async(req, res) => {
    try {
        const user = await User.findById(req.query.userId);

        let posts = await Post.find({ userId: req.query.userId });
        posts = posts.map(p => ({...p._doc, owner: user}));
        
        const followings = await Promise.all(user.followings.map((followingId) => (User.findById(followingId))));
            
        const tempPromise = (f) => {
            return new Promise((resolve, reject) => {
            Post.find({ userId : f._id })
                .then(fPosts => {
                    let tempFPosts = fPosts.map(fp => ({...fp._doc, owner: f}));
                    resolve(tempFPosts);
                })
            }) 
        }

        const followingsPosts = await Promise.all(followings.map(f => tempPromise((f))));
        
        posts = posts.concat(...followingsPosts);
        return res.status(200).json(posts);
    } catch (err) {
        console.log(err);
        res.status(500).json(err); 
    }
})


// Get user videos
router.get('/videos/:userId', async(req, res) => {
    try {
        const postsWithVideos = await Post.find({ userId: req.params.userId, "content.type" : 'video' });
        const videos = [];
        postsWithVideos.forEach(post => {
            post.content.forEach(item => {
                if (item.type === 'video') videos.push({ ...item, originalPost: post });
            }) 
        })
        res.status(200).json(videos);
    } catch (err) {
        res.status(500).json(err); 
    }
})

// Get user stories
// Get user videos
router.get('/stories/:userId', async(req, res) => {
    try {
        const postsWithVideos = await Post.find({ userId: req.params.userId, "content.type" : 'video' });
        const videos = [];
        postsWithVideos.forEach(post => {
            post.content.forEach(item => {
                if (item.type === 'video') videos.push({ ...item, originalPost: post });
            }) 
        })
        res.status(200).json(videos);
    } catch (err) {
        res.status(500).json(err); 
    }
})

    
// Follow user
router.put('/:userId/follow', async(req, res) => {
    try {
        if (req.body.userId === req.params.userId) throw new Error("You can't follow yourself");
        const user = await User.findById(req.params.userId);
        const alreadyFollowed = user.followers.find(f => f === req.body.userId);

        if (alreadyFollowed) throw new Error("You have already followed this user");
        await User.findByIdAndUpdate(req.params.userId, { $push: { followers: req.body.userId } });
        await User.findByIdAndUpdate(req.body.userId, { $push : { followings: req.params.userId } });
        res.status(200).json({ msg: "User has been followed" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: err.message });  
    }
})


// Unfollow user
router.put('/:userId/unfollow', async(req, res) => {
    try {
        if (req.body.userId === req.params.userId) throw new Error("You can't unfollow yourself");
        const user = await User.findById(req.params.userId);
        const alreadyFollowed = user.followers.find(f => f === req.body.userId);

        if (!alreadyFollowed) throw new Error("You dont't follow this user");
        await User.findByIdAndUpdate(req.params.userId, { $pull: { followers: req.body.userId } });
        await User.findByIdAndUpdate(req.body.userId, { $pull : { followings: req.params.userId } });
        res.status(200).json({ msg: "User has been unfollowed" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: err.message });  
    }
})


// Get user followers
router.get('/followers/:userId', async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) throw new Error("No such user found!");

        const followers = await Promise.all(user.followers.map(f => User.findById(f).select(["-password", "-email", "-from", "-coverImg", "-createdAt", "-updatedAt"])));
        res.status(200).json(followers);
    } catch (err) {
        console.log(err);
    }
})


// Get user followings
router.get('/followings/:userId', async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) throw new Error("No such user found!");

        const followings = await Promise.all(user.followings.map(f => User.findById(f).select(["-password", "-email", "-from", "-coverImg", "-createdAt", "-updatedAt"])));
        res.status(200).json(followings);
    } catch (err) {
        console.log(err);
    }
})


module.exports = router;