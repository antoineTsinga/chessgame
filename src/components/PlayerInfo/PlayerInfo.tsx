import React, { useCallback, useEffect, useState } from "react";
import Game from "../../core/config/Game";
import Player from "../../core/types/Player";
import { Color } from "../../core/types/Type";
import "./PlayerInfo.css";
import { Clock } from "../../core/icons/icons";
import { ImagesLoader } from "../../core/config/ImagesLoader.ts";

export interface BoardProps {
  game: Game;
  player: Player;
  setEndGame: React.Dispatch<boolean>;
  startGame: boolean;
  startTimeDate: number;
  isWatching: boolean;
}
const imageLoader = ImagesLoader.instance;
const PlayerInfo: React.FC<BoardProps> = ({
  game,
  player,
  setEndGame,
  startGame, // if the as start
  startTimeDate, // The date from which we start counting the time elapsed by the player
  isWatching,
}) => {
  const [active, setActive] = useState<boolean>(false);
  const [time, setTime] = useState<number>(game.timers[player.color]);
  const [advantage, setAdvantage] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();
  const colortakenPieces: Color = game.getOpponent(player).color;

  const countAdvantage2 = () => {
    const point = game
      .leftPieceTo(player)
      .reduce((p, p2) => p + p2.piece.value, 0);
    const adversary = game
      .leftPieceTo(game.getOpponent(player))
      .reduce((p, p2) => p + p2.piece.value, 0);

    return Math.max(0, point - adversary);
  };

  useEffect(() => {
    if (time <= 0 || game.isGameFinished) {
      setTime(Math.max(0, time));
      game.timers[player.color] = Math.max(0, time);
      game.setWinner();
      setActive(false);
      setEndGame(true);
      clearInterval(intervalId);
    }
  }, [game.isGameFinished, time]);

  useEffect(() => {
    if (!startGame && !isWatching) {
      console.log("gmae not start");
      return;
    }
    if (game.isTurn(player)) {
      // start timer if turn to play
      setTime(game.timers[player.color]);
      setActive(true);
      const interval = setInterval(() => {
        const now = Date.now() / 1000;
        const t = game.timers[player.color] - (now - game.startTimeDate);
        setTime(t);
      }, 50);
      setIntervalId(interval);
    } else {
      setTime(game.timers[player.color]);
      if (intervalId) {
        clearInterval(intervalId);
      }
      setActive(false);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [startGame, game, player, startTimeDate, isWatching]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const t = `${minutes < 10 ? "0" : ""}${minutes}:${
      seconds < 10 ? "0" : ""
    }${seconds}`;

    if (minutes === 0 && seconds < 10) {
      return Math.round(time * 100) / 100;
    }
    return t;
  };

  const printPiece = (code: string) => {
    //add taken pieces
    let leftpixels = 1;
    return game.takenPieces[colortakenPieces]
      .filter((piece) => piece.code === code && piece.color !== player.color)
      .map((piece, index) => {
        leftpixels -= 0;
        const n =
          game.takenPieces[colortakenPieces].filter(
            (piece) => piece.code === code && piece.color !== player.color
          ).length - 1;
        return (
          <img
            key={index}
            className="item-piece"
            src={imageLoader.getImageByClass(piece)}
            alt={piece.name}
            style={{
              left: leftpixels + "rem",
              marginRight: index === n ? "20px" : 0,
            }}
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
          <span>{countAdvantage2() > 0 && "+" + countAdvantage2()}</span>
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
