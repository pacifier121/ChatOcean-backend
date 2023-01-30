const router = require('express').Router();
const passport = require('passport');
const { ensureAuth } = require('../middleware/auth');


// Google OAuth for register
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: 'http://localhost:8000/register',
    successRedirect: 'http://localhost:8000/'
}))

router.get('/checkAuthentication', (req, res) => {
    if (req.isAuthenticated()){
        console.log("YES")
    }
    res.json(req.user);
})


module.exports = router;