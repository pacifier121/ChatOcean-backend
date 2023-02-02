const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require("passport");
const cors = require('cors');
require('./config/passport')(passport);

// Configuting .env file
require('dotenv').config();
require('./config/db');


// Initializing app
const app = express();
app.use(session({
  secret: 'mysecret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({ mongooseConnection: mongoose.connection }),
  maxAge: 24*60*60*100
}))

app.use(passport.initialize());
app.use(passport.session())
app.use(express.json());
app.use(helmet());
app.use(morgan("dev"));
app.use(cors({
  origin: '*'
}))

// To use images on server
app.use("/public", (_, res, next) => {
  res.set("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/public/", express.static(path.join(__dirname, "public/")));



// Registering routers
app.use('/', require('./routes/indexRouter'));
app.use("/auth", require('./routes/authRouter'));
app.use("/user", require('./routes/userRouter'));
app.use("/post", require('./routes/postRouter'));
app.use("/story", require('./routes/storyRouter'));


// Listening on port
const PORT = 8000;
app.listen(PORT, () => {
  console.log("Server up and running on port " + PORT);
});
