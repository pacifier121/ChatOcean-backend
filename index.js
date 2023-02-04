const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const passport = require("passport");
const cors = require('cors');
const socketEventsHandler = require('./socket/socketEvents');
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


// Initializing socket.io server
const server = require('http').Server(app);
const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});

// Handling socket events
socketEventsHandler(io);

// Utilising various middlewares
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
app.use("/chat", require('./routes/chatRouter'));


// Listening on port
const PORT = 8000;
server.listen(PORT, () => {
  console.log("Socket server up and running");
  console.log("Server up and running on port " + PORT);
});

