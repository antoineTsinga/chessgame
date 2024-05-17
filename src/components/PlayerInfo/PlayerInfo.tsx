import React, { useEffect, useState } from "react";
import Game from "../../core/config/Game";
import Player from "../../core/types/Player";
import { Color } from "../../core/types/Type";
import "./PlayerInfo.css";
import { Clock } from "../../core/icons/icons";

export interface BoardProps {
  game: Game;
  player: Player;
}

const PlayerInfo: React.FC<BoardProps> = ({ game, player }) => {
  const [active, setActive] = useState<boolean>(false);
  const [time, setTime] = useState<number>(game.timers[player.color]);

  useEffect(() => {
    if (time === 0) return;

    const intervalId = setInterval(() => {
      game.timers[player.color] = game.timers[player.color] - 1;
      setTime((prevSeconds) => prevSeconds - 1);
    }, 1000);

    if (game.whoPlay === player) {
      setActive(true);
    } else {
      setActive(false);
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [game.timers, game.whoPlay, player]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;
  };

  const colortakenPieces: Color = player.color === "black" ? "white" : "black";
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
        <span>{player.name + " " + player.color}</span>
        <div className="pieces">
          <div className="pawn relative">{printPiece("P")}</div>
          <div className="knight relative">{printPiece("N")}</div>
          <div className="bishop relative">{printPiece("B")}</div>
          <div className="rook relative">{printPiece("R")}</div>
          <div className="queen relative">{printPiece("Q")}</div>
        </div>
      </div>

      <div className={`timer ${active && "active"}`}>
        <Clock width={"1em"} style={{ opacity: active ? 1 : 0 }} />
        <span>{formatTime(time)}</span>
      </div>
    </div>
  );
};

export default PlayerInfo;
