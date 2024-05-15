import "./App.css";
import Board from "./components/Board/Board.tsx";
import Login from "./components/Login/Login.tsx";

function App() {
  return (
    <div className="App">
      <Login />
      <Board />
    </div>
  );
}

export default App;
