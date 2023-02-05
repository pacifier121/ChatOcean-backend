const router = require("express").Router();
const Chat = require("../models/Chat");
const User = require("../models/User");

// Post a new message
router.post("/message", async (req, res) => {
  try {
    const chatUser = await User.findOne({ username: req.body.chatName });
    if (!chatUser) throw new Error("No such chat of this user found!");

    const members = [req.body.senderId.toString(), chatUser._id.toString()].sort();
    const chat = await Chat.findOne({ members });

    const msg = req.body.msg;
    msg.senderId = msg.senderId; 
    if (!chat) {
      // Create a new chat with those two members
      const newChat = new Chat({
        members,
        content: [msg],
      });
      await newChat.save();
      return res.status(200).json(newChat);
    }

    await Chat.findByIdAndUpdate(chat._id, { $push: { content: msg } });
    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Get chat
router.get("/chat/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) throw new Error("No such chat found!");

    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Get chat by members
router.get("/chat/:userId/:chatName", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) throw new Error("No such user found!");

    const chatUser = await User.findOne({ username: req.params.chatName });
    if (!chatUser) throw new Error("No such chat of this user found!");

    const members = [user._id.toString(), chatUser._id.toString()].sort();
    const chat = await Chat.findOne({ members });
    if (!chat) throw new Error("No such chat found!");

    res.status(200).json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Delete a chat
router.delete("/chat/:chatId", async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) throw new Error("No such chat found!");
    
    await Chat.findByIdAndDelete(chat._id);
    res.status(200).json({ msg: "Chat deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

module.exports = router;
