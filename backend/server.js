const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// HOME ROUTE
app.get("/", (req, res) => {
  res.send("TaskSwap backend is running 🚀");
});

// DATABASE
mongoose.connect("mongodb+srv://Taskswap_db_user:Taskswap2026@cluster0.0klp7bw.mongodb.net/taskswap?retryWrites=true&w=majority")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

// MODELS
const Task = mongoose.model("Task", {
  link: String,
  platform: String
});

const User = mongoose.model("User", {
  username: String,
  credits: { type: Number, default: 50 }
});


// ================= USERS =================

// CREATE USER
app.post("/user", async (req, res) => {
  try {
    const user = new User({ username: req.body.username });
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET USER
app.get("/user/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  res.json(user);
});


// ================= TASKS =================

// GET TASKS
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE TASK (WITH CREDIT CHECK)
app.post("/tasks", async (req, res) => {
  try {
    const { link, platform, username } = req.body;

    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.credits < 10) {
      return res.status(400).json({ error: "Not enough credits" });
    }

    user.credits -= 10;
    await user.save();

    const task = new Task({ link, platform });
    await task.save();

    res.json({ task, credits: user.credits });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// COMPLETE TASK (ADD CREDITS)
app.post("/complete", async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username });

    if (!user) return res.status(404).json({ error: "User not found" });

    user.credits += 5;
    await user.save();

    res.json({ credits: user.credits });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});