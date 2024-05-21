import React, { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import CreateGame from "../CreateGame";
import ChessGame from "../ChessGame";
import WebSocketComponent from "../../core/config/WebSocketComponent.tsx";

export default function Layout() {
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [roomName, setRoomName] = useState(null);

  useEffect(() => {
    if (!roomName) return;

    const ws = new WebSocket(`ws://localhost:8000/ws/game/${roomName}/`);
    setSocket(ws);
  }, [roomName]);

  return (
    <div>
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
