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

// DATABASE (FIXED ATLAS CONNECTION)
mongoose.connect(
  "mongodb://Taskswap_db_user:Taskswap2026@ac-pok61qh-shard-00-00.0klp7bw.mongodb.net:27017,ac-pok61qh-shard-00-01.0klp7bw.mongodb.net:27017,ac-pok61qh-shard-00-02.0klp7bw.mongodb.net:27017/taskswap?ssl=true&replicaSet=atlas-sgd0l7-shard-0&authSource=admin&appName=Cluster0"
)
.then(() => console.log("MongoDB connected"))
.catch((err) => console.log("MongoDB error:", err));

// MODEL
const Task = mongoose.model("Task", {
  link: String,
  platform: String
});

// GET TASKS
app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// ADD TASK
app.post("/tasks", async (req, res) => {
  const task = new Task(req.body);
  await task.save();
  res.json(task);
});

// START SERVER
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});