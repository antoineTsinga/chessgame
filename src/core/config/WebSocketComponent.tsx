import React, { useEffect, useState } from "react";
import Game from "./Game.ts";
import Board from "../../components/Board/Board.tsx";
import { Color, Move } from "../types/Type";
import { useParams } from "react-router-dom";
import Player from "../types/Player.ts";

const WebSocketComponent = ({ playerName, isHost, socket, roomId }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [chess, setChess] = useState<Game | null>(null);
  const [fen, setFen] = useState("");
  const [move, setMove] = useState<Move | null>(null);
  const [startGame, setStartGame] = useState<boolean>(false);

  socket.onopen = () => {
    console.log("WebSocket connected");
    if (isHost && !chess) {
      const color: Color[] = ["white", "black"];
      const random = Math.round(Math.random());
      setChess(new Game(playerName, color[random]));
      console.log("it is host");
    } else if (!isHost && !chess) {
      console.log("it not is host");
      getMyColor();
    }
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "move" && chess) {
      chess.move(data.content);
      setFen(chess.generateFEN());
    } else if (data.type === "findcolor") {
      if (isHost && chess) {
        const opponent = data.content;
        chess.player2.name = opponent.name;
        chess.isGameStart = true;
        setColor(chess.player1, chess.player2);
      }
    } else if (data.type === "setcolor") {
      if (!isHost && !chess) {
        const players = data.content;
        const game = new Game(players.guest.name, players.guest.color);
        game.player2.name = players.host.name;
        console.log("receve color from host");
        setChess(game);
        sendStartGame();
      }
    } else if (data.type === "start") {
      setStartGame(true);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket Disconnected");
  };

  const getMyColor = () => {
    if (socket) {
      console.log("find color");
      const me = new Player();
      me.name = playerName;
      socket.send(
        JSON.stringify({
          type: "findcolor",
          content: me,
        })
      );
    }
  };

  const setColor = (host: Player, guest: Player) => {
    if (socket) {
      console.log("setting color");
      socket.send(
        JSON.stringify({
          type: "setcolor",
          content: { host, guest },
        })
      );
    }
  };

  const sendMove = (move: Move) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "move",
          content: move,
        })
      );
    }
  };

  const sendStartGame = () => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "start",
          content: true,
        })
      );
    }
  };

  useEffect(() => {
    if (move === null || !chess) return;
    setFen(chess.generateFEN());
    sendMove(move);
  }, [chess, move]);

  useEffect(() => {
    if (startGame && chess) {
      chess.isGameStart = true;
      console.log("starting game");
    }
  }, [chess, startGame]);

  return (
    <div>
      <h1>Game Room: {roomId}</h1>
      {chess ? (
        <div>
          <Board game={chess} setMove={setMove} startGame={startGame} />
        </div>
      ) : (
        <></>
      )}
      <div>
        <h2>Chat</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
        <input type="text" id="chat-message-input" />
        <button>Send</button>
      </div>
    </div>
  );
};

export default WebSocketComponent;
