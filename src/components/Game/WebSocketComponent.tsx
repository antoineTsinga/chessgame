import React, { useEffect, useState } from "react";
import Game from "../../core/config/Game.ts";
import Board from "../Board/Board.tsx";
import { Color, Move } from "../../core/types/Type.ts";
import Player from "../../core/types/Player.ts";
import "./WebSocketComponent.css";

const WebSocketComponent = ({ playerName, isHost, socket, roomId }) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [chess, setChess] = useState<Game | null>(null);
  const [fen, setFen] = useState("");
  const [move, setMove] = useState<Move | null>(null);
  const [startGame, setStartGame] = useState<boolean>(false);

  socket.onopen = () => {
    console.log("connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "move" && chess) {
      setMove(null);
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

        setChess(game);
        sendStartGame();
      }
    } else if (data.type === "start") {
      setStartGame(true);
    }
  };

  socket.onclose = () => {};

  const getMyColor = () => {
    if (socket) {
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
      chess?.move(move);
      console.log("move");
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
    if (socket.OPEN) {
      if (isHost && !chess) {
        const color: Color[] = ["white", "black"];
        const random = Math.round(Math.random());
        setChess(new Game(playerName, color[random]));
      } else if (!isHost && !chess) {
        getMyColor();
      }
    }
  }, [socket]);

  useEffect(() => {
    if (move === null || !chess) return;
    setFen(chess.generateFEN());
    sendMove(move);
  }, [chess, move]);

  useEffect(() => {
    if (startGame && chess) {
      chess.isGameStart = true;
    }
  }, [chess, startGame]);

  return (
    <div className="game-view">
      <h1 className="game-code">Game Room: {roomId}</h1>
      {chess ? (
        <div className="game-board">
          <Board game={chess} setMove={setMove} startGame={startGame} />
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default WebSocketComponent;
