const router = require('express').Router();
const passport = require('passport');


// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: 'http://localhost:8000/register',
    successRedirect: 'http://localhost:8000/login'
}))

// router.get('/checkAuthentication', (req, res) => {
//     if (req.user) {
//         return res.send({ authenticated: true });
//     }
//     return { authenticated: false }
// })


module.exports = router;