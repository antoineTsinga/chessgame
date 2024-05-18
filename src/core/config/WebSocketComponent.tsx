import React, { useEffect, useState } from "react";
import Chessboard from "chessboard.jsx";
import Chess from "chess.js";

const WebSocketComponent = ({ roomName }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [chess, setChess] = useState(new Chess());
  const [fen, setFen] = useState("start");

  useEffect(() => {
    const ws = new WebSocket(
      `ws://${window.location.host}/ws/game/${roomName}/`
    );
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket Connected");
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "move") {
        chess.move(data.move);
        setFen(chess.fen());
      } else if (data.type === "chat") {
        setMessages((prevMessages) => [...prevMessages, data.message]);
      }
    };

    ws.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      ws.close();
    };
  }, [roomName, chess]);

  const sendMove = (move) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "move",
          move: move,
        })
      );
    }
  };

  const sendMessage = (message) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "chat",
          message: message,
        })
      );
    }
  };

  const onDrop = ({ sourceSquare, targetSquare, promotion }) => {
    const move = chess.move({
      from: sourceSquare,
      to: targetSquare,
      promotion: promotion, // always promote to a queen for simplicity
    });

    if (move === null) return;
    setFen(chess.fen());
    sendMove(move);
  };

  return (
    <div>
      <h1>Game Room: {roomName}</h1>
      <div>
        <Chessboard position={fen} onDrop={onDrop} draggable={true} />
      </div>
      <div>
        <h2>Chat</h2>
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
        <input type="text" id="chat-message-input" />
        <button
          onClick={() =>
            sendMessage(document.getElementById("chat-message-input")?.value)
          }
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default WebSocketComponent;
