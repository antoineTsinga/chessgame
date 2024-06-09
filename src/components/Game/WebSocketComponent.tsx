import React, { useEffect, useState } from "react";
import Game from "../../core/config/Game.ts";
import Board from "../Board/Board.tsx";
import {
  BoardType,
  Color,
  Move,
  NodeMove,
  ReMatch,
} from "../../core/types/Type.ts";
import Player from "../../core/types/Player.ts";
import "./WebSocketComponent.css";
import Modal from "../Modal/Modal.tsx";
import LoadingDot from "../../core/icons/LoadingDot.jsx";
import PlayerInfo from "../PlayerInfo/PlayerInfo.tsx";
import {
  GravityUiBars,
  GravityUiChevronLeft,
  GravityUiChevronRight,
  GravityUiCopy,
} from "../../core/icons/icons.jsx";
import SoundManager from "../../core/sounds/SoundManager.jsx";
import { backendUrl } from "../../core/config/backends.js";
import Cell from "../../core/types/Cell.ts";
import IPiece from "../../core/types/IPiece.ts";
import Pawn from "../../core/types/Pawn.ts";
import Bishop from "../../core/types/Bishop.ts";
import King from "../../core/types/King.ts";
import Knight from "../../core/types/Knight.ts";
import Rook from "../../core/types/Rook.ts";
import Queen from "../../core/types/Queen.ts";

export interface GameProps {
  playerName: string;
  isHost: boolean;
  socket: WebSocket;
  closeSocket: (code?: number | undefined, reason?: string | undefined) => void;
  roomId: string;
}

type IPieceDTO = {
  id: number;
  color: Color;
  img: string;
  isFirstMove: boolean;
  name: string;
  code: string;
  value: number;
  enPassant: Cell | null;
};
type CellDTO = {
  row: number;
  column: number;
  piece: IPieceDTO;
  color: Color;
};
function createPieceFromModel(piece: IPieceDTO): IPiece {
  let ipiece;
  switch (piece.code) {
    case "P":
      ipiece = new Pawn(piece.color, piece.img);
      break;
    case "B":
      ipiece = new Bishop(piece.color, piece.img);
      break;
    case "K":
      ipiece = new King(piece.color, piece.img);
      break;
    case "N":
      ipiece = new Knight(piece.color, piece.img);
      break;
    case "R":
      ipiece = new Rook(piece.color, piece.img);
      break;
    case "Q":
      ipiece = new Queen(piece.color, piece.img);
      break;
  }

  ipiece.isFirstMove = piece.isFirstMove;
  ipiece.enPassant = piece.enPassant;
  return ipiece;
}

const DTOtoCell = ({ row, column, piece, color }: CellDTO): Cell => {
  const cell: Cell = new Cell(row, column, color);
  if (piece) cell.piece = createPieceFromModel(piece);
  return cell;
};
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
  const [endGame, setEndGame] = useState<boolean>(false);
  const [endGameModal, setEndGameModal] = useState<boolean>(false);
  const [rematch, setRematch] = useState<ReMatch | null>(null); // define if there is a pendding rematch request
  const [timeLeftTo, setTimeLeftTo] = useState<number>(0);
  const [soundType, setSoundType] = useState(""); //Play sound after each moves
  const [isWatching, setIsWatching] = useState<boolean>(false);

  socket.onopen = () => {
    console.log("connected");
    if (socket.OPEN) {
      if (isHost && !chess) {
        const color: Color[] = ["white", "black"];
        const random = Math.round(Math.random());
        setChess(new Game(playerName, color[random]));
      } else if (!isHost && !chess) {
        getMyColor();
        // console.log("getColor");
      }
    }
  };

  useEffect(() => {
    const indentifier = setInterval(() => {
      fetch(`${backendUrl}/create_game/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
    }, 14000);
    return clearInterval(indentifier);
  }, []);
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const t = `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;

    if (minutes === 0) return Math.round(time * 100) / 100;
    return t;
  };
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "move" && chess) {
      const moveSend = data.content.move;
      const startTime = data.content.startTime;
      const moveMaked = chess.move(moveSend, startTime);
      setMove(null);

      if (moveMaked) {
        setTimeLeftTo(startTime);
        setSoundType(moveMaked);
      }
    } else if (data.type === "findcolor") {
      // console.log("findcolor");
      // Player who join game send findcolor message to know is color and the send a response
      if (isHost && chess && !chess.player2.name) {
        // console.log("findcolor");
        const opponent = data.content;
        chess.player2.name = opponent.name;
        setColor(chess.player1, chess.player2);
        return;
      } else if (isHost && chess && chess.player2.name) {
        // Player who join game send findcolor message but there are already two players
        // console.log("watchmatch");
        sendWatchMatch({
          player1: chess.player1,
          player2: chess.player2,
          board: chess.board.map((row) => row.map((cell) => cell)),
          player1Play: chess.player1 === chess.whoPlay,
          startTime: timeLeftTo,
          timers: chess.timers,
        });
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

      const gameTime = data.content.time;
      chess.timers = { black: gameTime, white: gameTime };
      chess.startTimeDate = data.content.startTime;
      setTimeLeftTo(data.content.startTime);
      setEndGame(false);
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
    } else if (data.type === "viewMatch") {
      // console.log("viewMatch");
      if (!chess || !chess.player2.name || !chess.player2.name) {
        const {
          player1,
          player2,
          board,
          player1Play,
          timers,
          startTime,
        }: ViewMatch = data.content;
        const game = new Game(player1.name, player1.color);
        game.player2 = player2;
        game.board = board.map((row) =>
          row.map((cellDTO: CellDTO) => DTOtoCell(cellDTO))
        );
        // console.log("timers", timers);
        game.whoPlay = player1Play ? player1 : player2;
        game.timers = timers;

        // console.log(game);
        // setTimeLeftTo(timers[player1Play ? player1.color : player2.color]);
        setTimeLeftTo(startTime);
        setChess(game);
        setIsWatching(true);
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
  type ViewMatch = {
    player1: Player;
    player2: Player;
    player1Play: boolean;
    timers;
    startTime: number;
    board;
  };
  const sendWatchMatch = (viewMatch: ViewMatch) => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "viewMatch",
          content: viewMatch,
        })
      );
    }
  };
  useEffect(() => {
    if (socket.OPEN) {
    }
  }, [socket.OPEN]);

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
      setEndGame(true);
    }
  }, [chess, chess?.whoPlay]);

  useEffect(() => {
    setEndGameModal(endGame);
  }, [endGame]);

  useEffect(() => {
    if (soundType) {
      const timeout = setTimeout(() => setSoundType(""), 500);
      return () => clearTimeout(timeout);
    }
  }, [soundType]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const applyMoveNode = (moveNode: NodeMove | null) => {
    if (!chess || moveNode == null || moveNode.state == null) return;
    const from = moveNode.state[0];
    const to = moveNode.state[1];
    chess.board[from.row][from.column] = from;
    chess.board[to.row][to.column] = to;
    setSoundType(moveNode.type);
  };

  return (
    <div className="game-view">
      <div className="game-code-container">
        <h1 className="game-code">Game Room: {roomId}</h1>
        <GravityUiCopy
          className="copy-btn"
          onClick={() => copyToClipboard(roomId)}
        />
      </div>
      <div className="sound">
        <SoundManager soundType={soundType} />
      </div>

      {chess ? (
        <div className="game-board-container">
          <div className="game-board">
            <PlayerInfo
              startGame={startGame}
              game={chess}
              player={chess.player2}
              setEndGame={setEndGame}
              startTimeDate={chess.isTurn(chess.player2) ? timeLeftTo : 0}
              isWatching={isWatching}
            />
            <Board game={chess} setMove={setMove} startGame={startGame} />
            <PlayerInfo
              startGame={startGame}
              game={chess}
              player={chess.player1}
              setEndGame={setEndGame}
              startTimeDate={chess.isTurn(chess.player1) ? timeLeftTo : 0}
              isWatching={isWatching}
            />
            <div className="menu">
              <GravityUiBars
                className="icon-bar-menu"
                onClick={() => setEndGameModal(true)}
              />
              {endGame ? (
                <GravityUiChevronLeft
                  className="icon-bar-menu"
                  onClick={() => applyMoveNode(chess.prevState())}
                />
              ) : (
                <></>
              )}
              {endGame ? (
                <GravityUiChevronRight
                  className="icon-bar-menu"
                  onClick={() => applyMoveNode(chess.nextState())}
                />
              ) : (
                <></>
              )}
            </div>
          </div>
          {endGameModal ? (
            <>
              <Modal
                title={
                  endGame
                    ? chess.getWinner()
                      ? `${chess.getWinner()?.color} win`
                      : "It's a draw"
                    : "Options"
                }
                onclick={setEndGameModal}
              >
                {chess.winner === null && endGame ? (
                  <div className="win">🫱🏿‍🫲🏻</div>
                ) : chess.winner === chess.player1 ? (
                  <div className="win">🎉</div>
                ) : chess.winner === chess.player2 ? (
                  <div className="win">{!isWatching ? "😭" : "🎉"}</div>
                ) : (
                  <></>
                )}

                {!isWatching ? (
                  rematch?.request ? (
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
                  )
                ) : (
                  <></>
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
            </>
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
