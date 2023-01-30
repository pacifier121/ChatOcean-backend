const url = "http://localhost:3000";

module.exports = {
    ensureAuth: (req, res, next) => {
        if (req.isAuthenticated()){
           return next();
        } else {
            res.redirect(`${url}/login`);
        }
    },
    ensureGuest: (req, res, next) => {
        if (req.isAuthenticated()){
            return res.redirect(`${url}/login`);
        } else {
            next();
        }
    }
}