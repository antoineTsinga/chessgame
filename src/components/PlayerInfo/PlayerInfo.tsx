import React, { useEffect, useState } from "react";
import Game from "../../core/config/Game";
import Player from "../../core/types/Player";
import { Color } from "../../core/types/Type";
import "./PlayerInfo.css";
import { Clock } from "../../core/icons/icons";

export interface BoardProps {
  game: Game;
  player: Player;
  setEndGameModal: (value: boolean) => void;
  startGame: boolean;
}

const PlayerInfo: React.FC<BoardProps> = ({
  game,
  player,
  setEndGameModal,
  startGame,
}) => {
  const [active, setActive] = useState<boolean>(false);
  const [time, setTime] = useState<number>(game.timers[player.color]);
  const [advantage, setAdvantage] = useState<number>(0);
  const [startTimer, setStartTimer] = useState<boolean>(false);

  const colortakenPieces: Color = game.getOpponent(player).color;
  const adversaryColorTakenPieces: Color = player.color;

  useEffect(() => {
    if (!startTimer) return;
    const intervalId = setInterval(() => {
      game.timers[player.color] = Math.max(game.timers[player.color] - 1);
      setTime((prevSeconds) => Math.max(0, prevSeconds - 1));
    }, 1000);

    if (time === 0 || game.isGameOver()) {
      game.setWinner();
      setEndGameModal(true);
      clearInterval(intervalId);
    }

    const point = game
      .leftPieceTo(player)
      .reduce((p, p2) => p + p2.piece.value, 0);
    const adversary = game
      .leftPieceTo(game.getOpponent(player))
      .reduce((p, p2) => p + p2.piece.value, 0);

    setAdvantage(Math.max(0, point - adversary));
    if (game.whoPlay === player) {
      setActive(true);
    } else {
      setActive(false);
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [
    adversaryColorTakenPieces,
    colortakenPieces,
    game,
    game.takenPieces,
    game.timers,
    game.whoPlay,
    player,
    setEndGameModal,
    time,
    startTimer,
  ]);

  useEffect(() => {
    if (startGame) setStartTimer(true);
  }, [startGame]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  const printPiece = (code: string) => {
    let leftpixels = 20;
    return game.takenPieces[colortakenPieces]
      .filter((piece) => piece.code === code && piece.color !== player.color)
      .map((piece, index) => {
        leftpixels -= 20;
        return (
          <img
            key={index}
            className="item-piece"
            src={piece.img}
            style={{ left: leftpixels + "px" }}
            alt={piece.name}
          />
        );
      });
  };
  return (
    <div className="section-player">
      <img className="avater" src="/images/user.png" alt={player.name} />
      <div className="info-player">
        <span>
          {player.name ? player.name : "Waiting for your opponent..."}
        </span>
        <div className="pieces">
          <div className="pawn relative">{printPiece("P")}</div>
          <div className="knight relative">{printPiece("N")}</div>
          <div className="bishop relative">{printPiece("B")}</div>
          <div className="rook relative">{printPiece("R")}</div>
          <div className="queen relative">{printPiece("Q")}</div>
          <span>{advantage > 0 && "+" + advantage}</span>
        </div>
      </div>

      <div className={`timer ${active && time > 0 && "active"}`}>
        <Clock width={"1em"} style={{ opacity: active ? 1 : 0 }} />
        <span>{formatTime(time)}</span>
      </div>
    </div>
  );
};

export default PlayerInfo;
