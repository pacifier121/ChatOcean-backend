const router = require('express').Router();
const User = require('../models/User');

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




module.exports = router;