const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const helmet = require("helmet");
const authRouter = require("./routes/authRouter");
const userRouter = require("./routes/userRouter");
const postRouter = require("./routes/postRouter");
const storyRouter = require("./routes/storyRouter");
const path = require("path");
const dotenv = require('dotenv');

// Configuting .env file
dotenv.config();

// Connecting to database
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL, 
  { useNewUrlParser: true, useUnifiedTopology: true }
  , () => {
    console.log("Connected to DB")
  });


// Initializing app
const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// To use images on server
app.use("/images", (_, res, next) => {
  res.set("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use("/images/", express.static(path.join(__dirname, "public/")));

// Registering routers
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/post", postRouter);
app.use("/story", storyRouter);


// Listening on port
const PORT = 8000;
app.listen(PORT, () => {
  console.log("Server up and running on port " + PORT);
});
