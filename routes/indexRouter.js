const router = require('express').Router();
const { ensureAuth, ensureGuest } = require('../middleware/auth');
const User = require('../models/User');


router.get('/', ensureAuth, (req, res) => {
    res.redirect('http://localhost:3000/');
})

router.get('/login', (req, res) => {
    console.log("Reached here");
})

router.get('/register', async(req, res) => {
    res.redirect('http://localhost:3000/register');
})

router.post('/register', async(req, res) => {
    try {
        const newUser = new User(req.body);
        await newUser.save();
        res.status(200).json(newUser);
    } catch (err) {
        res.status(500).json(err);
    }
})


module.exports = router;
