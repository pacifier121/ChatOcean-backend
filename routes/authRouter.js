const router = require('express').Router();
const passport = require('passport');

router.post('/register', async(req, res) => {
    
})



// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));


router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/login',
    successRedirect: 'http://localhost:3000/'
}))


module.exports = router;