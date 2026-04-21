const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// ================= DB =================
mongoose.connect(
  "mongodb+srv://Taskswap_db_user:Taskswap2026@cluster0.0klp7bw.mongodb.net/taskswap?retryWrites=true&w=majority"
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("DB error:", err));

// ================= MODELS =================
const User = mongoose.model("User", {
  username: String,
  password: String,
  credits: { type: Number, default: 50 }
});

const Task = mongoose.model("Task", {
  link: String,
  platform: String,
  username: String
});

// ================= AUTH =================
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const exists = await User.findOne({ username });
  if (exists) return res.json({ error: "User already exists" });

  const user = new User({ username, password });
  await user.save();

  res.json(user);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username, password });
  if (!user) return res.json({ error: "Invalid login" });

  res.json(user);
});

app.get("/user/:username", async (req, res) => {
  const user = await User.findOne({ username: req.params.username });
  res.json(user);
});

// ================= TASKS =================
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

app.post("/tasks", async (req, res) => {
  const { link, platform, username } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ error: "User not found" });

  if (user.credits < 10)
    return res.json({ error: "Not enough credits" });

  user.credits -= 10;
  await user.save();

  const task = new Task({ link, platform, username });
  await task.save();

  res.json(task);
});

app.post("/complete", async (req, res) => {
  const { username } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ error: "User not found" });

  user.credits += 5;
  await user.save();

  res.json(user);
});

// ================= START =================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running"));