const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = "taskswap_secret_key";

// ================= DB =================
mongoose.connect(
  "mongodb+srv://Taskswap_db_user:Taskswap2026@cluster0.0klp7bw.mongodb.net/taskswap?retryWrites=true&w=majority"
)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log("MongoDB error:", err));

// ================= MODELS =================
const User = mongoose.model("User", {
  username: { type: String, unique: true },
  password: String,
  credits: { type: Number, default: 50 }
});

const Task = mongoose.model("Task", {
  link: String,
  platform: String,
  createdBy: String,
  completedBy: { type: [String], default: [] }
});

// ================= AUTH =================
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    password: hashed
  });

  res.json(user);
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(404).json({ error: "User not found" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(400).json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id }, SECRET, { expiresIn: "7d" });

  res.json({ token, username });
});

// ================= USERS =================
app.post("/user", async (req, res) => {
  const { username } = req.body;

  const user = await User.findOneAndUpdate(
    { username },
    { $setOnInsert: { username, credits: 50 } },
    { upsert: true, new: true }
  );

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

  if (!user) return res.status(404).json({ error: "User not found" });
  if (user.credits < 10) return res.status(400).json({ error: "Not enough credits" });

  user.credits -= 10;
  await user.save();

  const task = await Task.create({
    link,
    platform,
    createdBy: username
  });

  res.json({ task, credits: user.credits });
});

app.post("/complete", async (req, res) => {
  const { username, taskId } = req.body;

  const user = await User.findOne({ username });
  const task = await Task.findById(taskId);

  if (!user || !task)
    return res.status(404).json({ error: "User or task not found" });

  if (task.completedBy.includes(username))
    return res.status(400).json({ error: "Already completed" });

  task.completedBy.push(username);
  await task.save();

  user.credits += 5;
  await user.save();

  res.json({ credits: user.credits });
});

// ================= START =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});