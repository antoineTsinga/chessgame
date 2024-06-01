import React, { useEffect, useState } from "react";
import PlayerInfo from "../PlayerInfo/PlayerInfo.tsx";
import Modal from "../Modal/Modal.tsx";
import Cell from "../../core/types/Cell.ts";
import Game from "../../core/config/Game.ts";
import { makeMove, showPosibleMove } from "../../core/config/utils.ts";
import "./Board.css";
import { Move } from "../../core/types/Type.ts";

export interface BoardProps {
  game: Game;
  setMove: React.Dispatch<React.SetStateAction<Move | null>>;
  startGame: boolean;
}

const Board: React.FC<BoardProps> = ({ game, setMove, startGame }) => {
  const [current, setCurrent] = useState<Cell | null>(null);
  const [prevCell, setPrevCell] = useState<Cell | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Cell[]>([]);
  const [moveMade, setMoveMade] = useState<Cell[]>([]);
  const [endGameModal, setEndGameModal] = useState<boolean>(false);
  const [promotionModale, setPromotionModale] = useState<boolean>(false);

  const handleClick = (cell: Cell) => {
    if (promotionModale) return;
    if (game.isGameOver()) return;

    if (!prevCell && game.player1.color !== cell.piece?.color) {
      return;
    }

    if (game.whoPlay.color !== game.player1.color) return;
    setCurrent(cell);

    if (prevCell && !prevCell.isEmpty) {
      if (game.isPromotion(prevCell, cell)) {
        setPromotionModale(true);
        return;
      }
      makeMove(prevCell, cell, game, setPossibleMoves, setPrevCell, setMove);
    } else {
      setCurrent(cell);
      showPosibleMove(cell, game, setPossibleMoves, setPrevCell);
    }
  };

  useEffect(() => {}, [promotionModale]);

  useEffect(() => {
    if (game.isGameOver()) {
      setEndGameModal(true);
    }
    const lastMove = game.historyMove[game.historyMove.length - 1];

    if (lastMove) {
      setMoveMade([
        game.board[lastMove[0].row][lastMove[0].column],
        game.board[lastMove[1].row][lastMove[1].column],
      ]);
    }
    console.log("work");
  }, [game, game.whoPlay]);

  const setPromotionCall = (cell: Cell | null, code: string) => {
    if (prevCell === null || cell === null) return;

    const move = {
      from: [prevCell.row, prevCell.column],
      to: [cell.row, cell.column],
      promotion: code,
      time: 0,
    };
    setMove(move);
    setPossibleMoves([]);
    setPrevCell(null);
    setPromotionModale(false);
  };

  const isMoveInMade = (cell: Cell) => {
    if (moveMade.length < 2) return false;

    const from = moveMade[0];
    const to = moveMade[1];

    return cell === from || cell === to;
  };

  return (
    <div className="container">
      <div className="player-info">
        <PlayerInfo
          startGame={startGame}
          game={game}
          player={game.player2}
          setEndGameModal={setEndGameModal}
        />
      </div>
      <div className={`board ${game.player1.color === "black" && "reverse"}`}>
        {game.board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}${j}`}
              className={`cell ${
                isMoveInMade(cell) && cell.color + "-move-made"
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
      <div className="player-info">
        <PlayerInfo
          game={game}
          player={game.player1}
          setEndGameModal={setEndGameModal}
          startGame={startGame}
        />
      </div>

      {promotionModale && game.toPromote ? (
        <>
          <div className="promotion-background"></div>
          <div className="promotion">
            <img
              className="piece"
              src={`/images/pions/N${game.whoPlay.color.charAt(0)}.png`}
              alt={"Knight"}
              onClick={() => setPromotionCall(game.toPromote, "N")}
            />
            <img
              className="piece"
              src={`/images/pions/B${game.whoPlay.color.charAt(0)}.png`}
              alt={"Bishop"}
              onClick={() => setPromotionCall(game.toPromote, "B")}
            />
            <img
              className="piece"
              src={`/images/pions/R${game.whoPlay.color.charAt(0)}.png`}
              alt={"Rook"}
              onClick={() => setPromotionCall(game.toPromote, "R")}
            />
            <img
              className="piece"
              src={`/images/pions/Q${game.whoPlay.color.charAt(0)}.png`}
              alt={"Queen"}
              onClick={() => setPromotionCall(game.toPromote, "Q")}
            />
          </div>
        </>
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
          ) : game.winner === game.player1 ? (
            <div className="win">🎉</div>
          ) : (
            <div className="win">😭</div>
          )}
        </Modal>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Board;
