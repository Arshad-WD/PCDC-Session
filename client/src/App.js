import { useState } from "react";
import Login from "./components/Login";
import TodoApp from "./components/TodoApp";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));

  if (!token) {
    return <Login setToken={setToken} />;
  }

  return <TodoApp token={token} setToken={setToken} />;
}

export default App;