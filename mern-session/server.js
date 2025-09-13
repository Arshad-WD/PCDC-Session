const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/mernTodo");

// ----- MODELS -----
const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const TodoSchema = new mongoose.Schema({
  text: String,
  completed: { type: Boolean, default: false },
  userId: String,
});

const User = mongoose.model("User", UserSchema);
const Todo = mongoose.model("Todo", TodoSchema);

// ----- AUTH MIDDLEWARE -----
const auth = (req, res, next) => {
  var token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "No token" });
  
  // If token starts with Bearer, split it out
  if (token.startsWith("Bearer ")) {
    token = token.slice(7, token.length); // remove "Bearer "
  }

  jwt.verify(token, "secret123", (err, decoded) => {
    if (err) return res.status(401).json({ error: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

// ----- ROUTES -----
// Register
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  console.log("Inside register post call", req.body)
  const hashed = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashed });
  await user.save();
  res.json({ message: "User registered" });
});

// Login
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ error: "User not found" });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ error: "Invalid password" });

  const token = jwt.sign({ id: user._id }, "secret123");
  res.json({ token });
});

// Get Todos
app.get("/todos", auth, async (req, res) => {
  const todos = await Todo.find({ userId: req.userId });
  res.json(todos);
});

// Add Todo
app.post("/todos", auth, async (req, res) => {
  const todo = new Todo({ text: req.body.text, userId: req.userId });
  await todo.save();
  res.json(todo);
});

// Toggle Complete
app.put("/todos/:id", auth, async (req, res) => {
  const todo = await Todo.findById(req.params.id);
  todo.completed = !todo.completed;
  await todo.save();
  res.json(todo);
});

// Delete
app.delete("/todos/:id", auth, async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: "Todo deleted" });
});

app.listen(4000, () => console.log("Server running on http://localhost:4000"));