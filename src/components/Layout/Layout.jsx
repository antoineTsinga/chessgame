import React, { useEffect, useState } from "react";
import CreateGame from "../Login/CreateGame.jsx";
import WebSocketComponent from "../Game/WebSocketComponent.tsx";
import { backendWebSocketUrl } from "../../core/config/backends.js";
import "./Layout.css";

export default function Layout() {
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [roomName, setRoomName] = useState(null);

  useEffect(() => {
    if (!roomName) return;

    const ws = new WebSocket(`${backendWebSocketUrl}/ws/game/${roomName}/`);
    setSocket(ws);
  }, [roomName]);

  return (
    <div className="layout">
      {socket ? (
        <WebSocketComponent
          isHost={isHost}
          playerName={playerName}
          socket={socket}
          roomId={roomName}
        />
      ) : (
        <CreateGame
          setPlayerName={setPlayerName}
          setIsHost={setIsHost}
          setRoomName={setRoomName}
        />
      )}
    </div>
  );
}
