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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!roomName) return;

    setLoading(true);
    const ws = new WebSocket(`${backendWebSocketUrl}/ws/game/${roomName}/`);
    setSocket(ws);
  }, [roomName]);

  useEffect(() => {
    if (!socket) return;

    if (socket.OPEN) {
      // console.log("connected");
      setLoading(false);
    }

    socket.onclose = () => {
      setLoading(false);
      setSocket(null);
      console.log("closed");
    };

    socket.onerror = () => {
      setError(true);
      console.log("Error");
    };
  }, [socket]);

  return (
    <div className="layout">
      {socket && !loading && playerName ? (
        <WebSocketComponent
          isHost={isHost}
          playerName={playerName}
          socket={socket}
          roomId={roomName}
          closeSocket={() => socket.close()}
        />
      ) : (
        <CreateGame
          setPlayerName={setPlayerName}
          setIsHost={setIsHost}
          setRoomName={setRoomName}
          loading={loading}
        />
      )}
    </div>
  );
}
