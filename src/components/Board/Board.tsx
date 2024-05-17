import React, { useEffect, useState } from "react";
import PlayerInfo from "../PlayerInfo/PlayerInfo.tsx";
import Modal from "../Modal/Modal.tsx";
import Cell from "../../core/types/Cell.ts";
import Game from "../../core/config/Game.ts";
import { makeMove, setPromotion, showPosibleMove } from "./utils.ts";
import "./Board.css";
import Player from "../../core/types/Player.ts";

export interface BoardProps {
  game: Game;
  currentPlayer: Player;
}

const Board: React.FC<BoardProps> = ({ game, currentPlayer }) => {
  const [current, setCurrent] = useState<Cell | null>(null);
  const [prevCell, setPrevCell] = useState<Cell | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Cell[]>([]);
  const [moveMakeFrom, setMoveMakeFrom] = useState<Cell | null>(null);
  const [endGameModal, setEndGameModal] = useState<boolean>(false);
  const [promotionModale, setPromotionModale] = useState<boolean>(false);

  const handleClick = (cell: Cell) => {
    if (game.isGameOver()) return;
    if (prevCell && !prevCell.isEmpty) {
      makeMove(prevCell, cell, game, setPossibleMoves, setPrevCell);
    } else {
      if (game.whoPlay.color !== cell.piece?.color) {
        return;
      }
      setCurrent(cell);
      showPosibleMove(cell, game, setPossibleMoves, setPrevCell);
    }
  };

  useEffect(() => {
    if (game.toPromote) setPromotionModale(true);
  }, [game.toPromote]);

  useEffect(() => {
    if (game.isGameOver()) {
      setEndGameModal(true);
    }
  }, [game, game.whoPlay]);

  const setPromotionCall = (cell: Cell | null, code: string) => {
    setPromotion(cell, code, game, setPromotionModale);
  };

  return (
    <div className="container">
      <PlayerInfo
        game={game}
        player={game.player2}
        setEndGameModal={setEndGameModal}
      />
      <div className={`board ${game.player1.color === "black" && "reverse"}`}>
        {game.board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}${j}`}
              className={`cell ${
                (current === cell && !cell.isEmpty && "cell-target-piece") ||
                (moveMakeFrom === cell && "cell-target-piece")
              } ${cell.color} `}
              onClick={() => handleClick(cell)}
            >
              <div />
              {!cell.isEmpty && (
                <img
                  className={`piece ${
                    game.player1.color === "black" && " reverse"
                  }`}
                  src={cell.piece?.img}
                  alt={cell.piece?.name}
                />
              )}
              <div
                className={possibleMoves.includes(cell) ? "possible-moves" : ""}
              ></div>
            </div>
          ))
        )}
      </div>
      <PlayerInfo
        game={game}
        player={game.player1}
        setEndGameModal={setEndGameModal}
      />

      {promotionModale && game.toPromote && game.toPromote.piece ? (
        <div className="promotion">
          <img
            className="piece"
            src={`/images/pions/N${game.toPromote.piece.color.charAt(0)}.png`}
            alt={"Knight"}
            onClick={() => setPromotionCall(game.toPromote, "N")}
          />
          <img
            className="piece"
            src={`/images/pions/B${game.toPromote.piece.color.charAt(0)}.png`}
            alt={"Bishop"}
            onClick={() => setPromotionCall(game.toPromote, "B")}
          />
          <img
            className="piece"
            src={`/images/pions/R${game.toPromote.piece.color.charAt(0)}.png`}
            alt={"Rook"}
            onClick={() => setPromotionCall(game.toPromote, "R")}
          />
          <img
            className="piece"
            src={`/images/pions/Q${game.toPromote.piece.color.charAt(0)}.png`}
            alt={"Queen"}
            onClick={() => setPromotionCall(game.toPromote, "Q")}
          />
        </div>
      ) : (
        <></>
      )}
      {endGameModal ? (
        <Modal
          title={
            game.getWinner() ? `${game.getWinner()?.color} win` : "It's a draw"
          }
          onclick={setEndGameModal}
        >
          {game.winner === null ? (
            <div className="win">🫱🏿‍🫲🏻</div>
          ) : game.winner === currentPlayer ? (
            <div className="win">🎉</div>
          ) : (
            <div className="win">😭</div>
          )}
        </Modal>
      ) : (
        <input
          value="menu"
          type="button"
          onClick={() => setEndGameModal(true)}
        />
      )}
    </div>
  );
};

export default Board;
