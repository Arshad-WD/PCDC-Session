import { useEffect, useState } from "react";
import {
  Container,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
  Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function TodoApp({ token, setToken }) {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");

  const fetchTodos = async () => {
    const res = await fetch("http://localhost:4000/todos", {
      headers: { Authorization: token },
    });
    const data = await res.json();
    setTodos(data);
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const addTodo = async () => {
    await fetch("http://localhost:4000/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ text }),
    });
    setText("");
    fetchTodos();
  };

  const toggleTodo = async (id) => {
    await fetch(`http://localhost:4000/todos/${id}`, {
      method: "PUT",
      headers: { Authorization: token },
    });
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await fetch(`http://localhost:4000/todos/${id}`, {
      method: "DELETE",
      headers: { Authorization: token },
    });
    fetchTodos();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          My Todo App
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            label="Add Todo"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Button variant="contained" onClick={addTodo}>
            Add
          </Button>
        </Box>
        <List>
          {todos.map((todo) => (
            <ListItem
              key={todo._id}
              secondaryAction={
                <IconButton edge="end" onClick={() => deleteTodo(todo._id)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <Checkbox
                checked={todo.completed}
                onChange={() => toggleTodo(todo._id)}
              />
              <ListItemText
                primary={todo.text}
                style={{
                  textDecoration: todo.completed ? "line-through" : "none",
                }}
              />
            </ListItem>
          ))}
        </List>
        <Button sx={{ mt: 2 }} onClick={logout}>
          Logout
        </Button>
      </Box>
    </Container>
  );
}
