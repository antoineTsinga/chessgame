import React, { useCallback, useEffect, useState } from "react";
import Game from "../../core/config/Game";
import Player from "../../core/types/Player";
import { Color } from "../../core/types/Type";
import "./PlayerInfo.css";
import { Clock } from "../../core/icons/icons";

export interface BoardProps {
  game: Game;
  player: Player;
  setEndGameModal: React.Dispatch<boolean>;
  startGame: boolean;
  startTimeDate: number;
}

const PlayerInfo: React.FC<BoardProps> = ({
  game,
  player,
  setEndGameModal,
  startGame, // if the as start
  startTimeDate, // The date from which we start counting the time elapsed by the player
}) => {
  const [active, setActive] = useState<boolean>(false);
  const [time, setTime] = useState<number>(game.timers[player.color]);
  const [advantage, setAdvantage] = useState<number>(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();
  const colortakenPieces: Color = game.getOpponent(player).color;

  const countAdvantage = useCallback(
    (game: Game) => {
      const point = game
        .leftPieceTo(player)
        .reduce((p, p2) => p + p2.piece.value, 0);
      const adversary = game
        .leftPieceTo(game.getOpponent(player))
        .reduce((p, p2) => p + p2.piece.value, 0);

      return Math.max(0, point - adversary);
    },
    [player]
  );

  const interval = useCallback(() => {
    const now = Date.now() / 1000;
    setTime(game.timers[player.color] - (now - startTimeDate));
  }, [startTimeDate]);

  useEffect(() => {
    if (!startGame) return;

    if (game.isTurn(player)) {
      // start timer if turn to play
      setActive(true);
      setIntervalId(setInterval(interval, 50));
    } else {
      setActive(false);
      clearInterval(intervalId);
    }

    setAdvantage(countAdvantage(game));

    return () => clearInterval(intervalId);
  }, [countAdvantage, game, interval, player, startGame, startTimeDate]);

  useEffect(() => {
    if (time <= 0) {
      game.setWinner();
      setEndGameModal(true);
      clearInterval(intervalId);
    }
  }, [game, time]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
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
