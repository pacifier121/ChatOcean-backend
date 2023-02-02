const router = require('express').Router();
const User = require('../models/User');
const Post = require('../models/Post');
const { removeFields } = require('../constants/constants');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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


// For uploading files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
     cb(null, path.join(__dirname, './../public/'))
  },
  filename: (req, file, cb) => {
     cb(null, Date.now() + file.originalname);
  }
})

const multi_upload = multer({ storage }).array('images', 2);

// Update user
router.put('/update', multi_upload,  async(req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) throw new Error("No such user found");
        let updates = req.body;
        
        // Checking existing user emails and usernames
        let alreadyUser = null;
        if (req.body.email) alreadyUser = await User.findOne({ email: req.body.email });
        if (alreadyUser) throw new Error("User with same email exists already!");
        
        if (req.body.username) alreadyUser = await User.findOne({ username: req.body.username }) ;
        if (alreadyUser) throw new Error("User with same username exists already!");
        
        // Checking password correctness
        if (req.body.oldPassword && !req.body.newPassword) throw new Error("New password can't be empty");
        if (!req.body.oldPassword && req.body.newPassword) throw new Error("Old password can't be empty");
        if (req.body.oldPassword){
            if (!bcrypt.compare(req.body.oldPassword, user.password)) throw new Error("Incorrect old password!");
            else updates.password = bcrypt.hash(req.body.newPassword);
        } 

        // For storing uploaded files info
        const filesSrc = req.files.map(f => f.filename);
        const filesType = JSON.parse(req.body.types);
        for (let i = 0; i < filesSrc.length; i++){
            updates[filesType[i]] = filesSrc[i];
        } 

        // Removing unnecessary fields
        const userId = req.body.userId;
        updates = removeFields(updates, ['types', 'userId'])
        
        await User.findByIdAndUpdate(userId, updates);

        res.status(200).json({ msg: "Profile updated successfully" });
    } catch (err) {
        console.log(err);
        res.status(500).json({ err: err.message });
    }
})


// Delete user
router.delete('/user/:userId', async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) throw new Error("No such user found");

        // Delete all posts of user
        await Post.deleteMany({ userId: user._id });
        
        // Delete all the images of user
        fs.unlink(path.join(__dirname, '../public/' + user.avatar), () => { });
        fs.unlink(path.join(__dirname, '../public/' + user.coverImg), () => { });
        
        // Now delete the user
        await User.findByIdAndDelete(req.params.userId);
        res.status(200).json({ msg: "User deleted successfully" });
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


// Set post as favorite
router.put('/:userId/favorite', async(req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) throw new Error("No such user found!"); 
        
        if (user.favoritePosts.includes(req.body.postId)) {
            await User.findByIdAndUpdate(req.params.userId, { $pull : { favoritePosts: req.body.postId }});
            return res.status(200).json({ msg: "Post was removed from favorite" })
        } else {
            await User.findByIdAndUpdate(req.params.userId, { $push : { favoritePosts: req.body.postId }});
            return res.status(200).json({ msg: "Post was added to favorite" })
        }
    } catch (err) {
        console.log(err); 
    }
})


module.exports = router;