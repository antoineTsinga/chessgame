import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ChessGame = () => {
  const { roomId } = useParams();
  const [client, setClient] = useState(null);
  const [messages, setMessages] = useState([]);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const newClient = new WebSocket(`ws://localhost:8000/ws/game/room2/`);

    newClient.onopen = () => {
      console.log("WebSocket Client Connected");
    };

    newClient.onmessage = (message) => {
      const dataFromServer = JSON.parse(message.data);
      console.log("Message received from server:", dataFromServer);

      if (dataFromServer.type === "game.state") {
        setGameState(dataFromServer.message);
      } else {
        setMessages((prevMessages) => [
          ...prevMessages,
          dataFromServer.message,
        ]);
      }
    };

    setClient(newClient);

    return () => {
      if (newClient) {
        newClient.close();
      }
    };
  }, [roomId]);

  const sendMessage = (message) => {
    if (client) {
      client.send(
        JSON.stringify({
          type: "message",
          message: message,
        })
      );
    }
  };

  return (
    <div>
      <h1>Chess Game Room: {roomId}</h1>
      <div>
        <h2>Game State</h2>
        <pre>{JSON.stringify(gameState, null, 2)}</pre>
      </div>
      <div>
        <h2>Messages</h2>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
      <input
        type="text"
        onKeyPress={(e) => {
          if (e.key === "Enter") {
            sendMessage(e.target.value);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
};

export default ChessGame;
