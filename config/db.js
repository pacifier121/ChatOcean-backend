const mongoose = require('mongoose');

// Connecting to database
mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGO_URL, 
  { useNewUrlParser: true, useUnifiedTopology: true }
  , () => {
    console.log("Connected to MongoDB")
  });
