import React, { useEffect, useState } from "react";
import Game from "../../core/config/Game.ts";
import Board from "../Board/Board.tsx";
import { Color, Move, ReMatch } from "../../core/types/Type.ts";
import Player from "../../core/types/Player.ts";
import "./WebSocketComponent.css";
import Modal from "../Modal/Modal.tsx";
import LoadingDot from "../../core/icons/LoadingDot.jsx";
import PlayerInfo from "../PlayerInfo/PlayerInfo.tsx";

export interface GameProps {
  playerName: string;
  isHost: boolean;
  socket: WebSocket;
  closeSocket: (code?: number | undefined, reason?: string | undefined) => void;
  roomId: string;
}
const WebSocketComponent: React.FC<GameProps> = ({
  playerName,
  isHost,
  socket,
  roomId,
  closeSocket,
}) => {
  const [messages, setMessages] = useState<string[]>([]);
  const [chess, setChess] = useState<Game | null>(null);
  const [fen, setFen] = useState("");
  const [move, setMove] = useState<Move | null>(null);
  const [startGame, setStartGame] = useState<boolean>(false);
  const [endGameModal, setEndGameModal] = useState<boolean>(false);
  const [rematch, setRematch] = useState<ReMatch | null>(null); // define if there is a pendding rematch request
  const [timeLeftTo, setTimeLeftTo] = useState<number>(0);

  socket.onopen = () => {
    console.log("connected");
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "move" && chess) {
      const moveSend = data.content.move;
      const startTime = data.content.startTime;
      const moveMaked = chess.move(moveSend);
      setMove(null);

      if (moveMaked) setTimeLeftTo(startTime);
    } else if (data.type === "findcolor") {
      // Player who join game send findcolor message to know is color and the send a response
      if (isHost && chess) {
        const opponent = data.content;
        chess.player2.name = opponent.name;

        setColor(chess.player1, chess.player2);
      }
    } else if (data.type === "setcolor") {
      // The host send the color of it's opponent and set is name on game parameters
      if (!isHost && !chess) {
        const players = data.content;
        const game = new Game(players.guest.name, players.guest.color);
        game.player2.name = players.host.name;

        setChess(game);
        sendStartGame();
      }
    } else if (data.type === "start") {
      // message send to start the game
      if (!chess) return;
      chess.isGameStart = true;
      setTimeLeftTo(data.content.startTime);
      const gameTime = data.content.time;
      chess.timers = { black: gameTime, white: gameTime };
      setEndGameModal(false);
      setStartGame(true);
    } else if (data.type === "rematch") {
      // Messge send to reset the game and send start request
      setStartGame(false);
      const rematch: ReMatch = data.content;
      setRematch(rematch);
      if (rematch.response) {
        chess?.reMatch();
        setRematch(null);
        sendStartGame();
      }
    }
  };

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
    if (socket && chess && chess.isValidMove2(move)) {
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

  const sendRematch = (rematch: ReMatch) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "rematch",
          content: rematch,
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
    // setFen(chess.generateFEN());
    sendMove(move);
  }, [chess, move]);

  useEffect(() => {
    if (startGame && chess) {
      chess.isGameStart = true;
    }
  }, [chess, startGame]);

  useEffect(() => {
    if (chess && chess.isGameOver()) {
      setEndGameModal(true);
    }
  }, [chess, chess?.whoPlay]);

  return (
    <div className="game-view">
      <h1 className="game-code">Game Room: {roomId}</h1>
      {chess ? (
        <div className="game-board">
          <div>
            <PlayerInfo
              startGame={startGame}
              game={chess}
              player={chess.player2}
              setEndGameModal={setEndGameModal}
              startTimeDate={chess.isTurn(chess.player2) ? timeLeftTo : 0}
            />
            <Board game={chess} setMove={setMove} startGame={startGame} />
            <PlayerInfo
              game={chess}
              player={chess.player1}
              setEndGameModal={setEndGameModal}
              startGame={startGame}
              startTimeDate={chess.isTurn(chess.player1) ? timeLeftTo : 0}
            />
          </div>
          {endGameModal ? (
            <Modal
              title={
                chess.getWinner()
                  ? `${chess.getWinner()?.color} win`
                  : "It's a draw"
              }
              onclick={setEndGameModal}
            >
              {chess.winner === null ? (
                <div className="win">🫱🏿‍🫲🏻</div>
              ) : chess.winner === chess.player1 ? (
                <div className="win">🎉</div>
              ) : (
                <div className="win">😭</div>
              )}

              {rematch?.request ? (
                rematch?.requester !== chess.player1.color ? (
                  <button
                    className="btn"
                    type="button"
                    onClick={() => {
                      const req: ReMatch = {
                        request: true,
                        requester: chess.whoPlay.color,
                        response: true,
                      };
                      sendRematch(req);
                    }}
                    style={{ marginTop: "1rem" }}
                  >
                    Accept Rematch
                  </button>
                ) : (
                  <button className="btn" type="button">
                    <LoadingDot width={"40px"} />
                  </button>
                )
              ) : (
                <button
                  className="btn"
                  type="button"
                  onClick={() => {
                    const req: ReMatch = {
                      request: true,
                      requester: chess.player1.color,
                      response: false,
                    };
                    sendRematch(req);
                  }}
                  style={{ marginTop: "1rem" }}
                >
                  Rematch
                </button>
              )}
              <button
                className="btn"
                type="button"
                onClick={() => {
                  closeSocket();
                }}
                style={{ marginTop: "1rem" }}
              >
                Home
              </button>
            </Modal>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default WebSocketComponent;
