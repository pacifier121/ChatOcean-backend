const Post = require('../models/Post');
const { removeFields } = require('../constants/constants');
const User = require('../models/User');
const multer = require('multer');
const path = require('path');
const { unlink } = require('fs');

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

// For uploading files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
     cb(null, path.join(__dirname, './../public/'))
  },
  filename: (req, file, cb) => {
     cb(null, Date.now() + file.originalname);
  }
})

const multi_upload = multer({ storage }).array('post_upload', 2);

const single_upload = multer({ storage }).single('post_upload');

const multi_upload_middleware = (req, res, next) => {
    multi_upload(req, res, (err) => {
        if (err){
            console.log(err);
            return res.send(err);
        } else {
            next();
        }
    });
}

// Post a post
router.post('/post', multi_upload_middleware,  async(req, res) => {
    const content = [];
    if (req.body.type) {
        const type = JSON.parse(req.body.type);
        for (let i = 0; i < req.files.length; i++){
            content.push({
                type: type[i],
                src: req.files[i].filename
            })
        }
    }
    try {
        const newPost = new Post({
            userId: req.body.userId,
            desc: req.body.desc,
            content: content
        }); 
        await newPost.save();        
        
        res.status(200).json(newPost);
    } catch (err) {
        console.log(err); 
        res.status(500).json(err);
    }
})

// Delete a post
router.delete('/post/:postId', async(req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ err: "Post not found" });
        
        // Now delete the post
        post.content.forEach(item => {
            unlink(path.join(__dirname, '../public/' + item.src), () => {});
        })
        
        await Post.findByIdAndDelete(post._id);
        res.status(200).json({ msg: "Post has been deleted!" });
    } catch (err) {
        console.log(err)
        res.status(500).json(err); 
    }
})

// Like/Unlike a post
router.put('/:postId/like', async(req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ err: "Post not found" });
        if (post.likes.includes(req.body.userId)) {
            await Post.findByIdAndUpdate(req.params.postId, { $pull : { likes: req.body.userId }});
            return res.status(200).json({ msg: "Post was unliked" })
        } else {
            await Post.findByIdAndUpdate(req.params.postId, { $push : { likes: req.body.userId }});
            return res.status(200).json({ msg: "Post was liked" })
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})

// Get post's states
router.get('/states/:postId/:userId', async(req, res) => {
    try {
        let postStates = { isLiked: false, isFavorite: false, isCommented: false, 
                totalLikes: 0, totalComments: 0, comments: [] }

        const post = await Post.findById(req.params.postId);
        if (!post) throw new Error("No such post found!");
        if (post.likes.includes(req.params.userId)) postStates.isLiked = true;
        postStates.totalLikes = post.likes.length;

        const user = await User.findById(req.params.userId);
        if (!user) throw new Error("No such user found!");
        if (user.favoritePosts.includes(req.params.postId)) postStates.isFavorite = true;
        postStates.totalComments = post.comments.length;
        
        res.status(200).json(postStates);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
})


module.exports = router;
