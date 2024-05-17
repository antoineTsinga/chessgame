import "./App.css";
import Board from "./components/Board/Board.tsx";
import Login from "./components/Login/Login.tsx";
import Game from "./core/config/Game.ts";

function App() {
  const game = new Game("player1");
  game.player2.name = "player2";
  return (
    <div className="App">
      {/* <Login /> */}
      <Board game={game} current={game.player1} />
    </div>
  );
}

export default App;
