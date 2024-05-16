import React, { useState } from "react";
import "./Board.css";

import Cell from "../../core/types/Cell.ts";
import Game from "../../core/config/Game.ts";

interface BoardProps {
  game: Game;
}

const Board: React.FC<BoardProps> = ({ game }) => {
  const [current, setCurrent] = useState<Cell | null>(null);
  const [prevCell, setPrevCell] = useState<Cell | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Cell[]>([]);
  const [moveMakeFrom, setMoveMakeFrom] = useState<Cell | null>(null);

  const showPosibleMove = (from: Cell) => {
    //console.log("piece", from);
    setPossibleMoves(game.possibleMoveFrom(from));
    setPrevCell(from);
  };

  const makeMove = (to: Cell) => {
    if (
      !prevCell ||
      to === prevCell ||
      to?.piece?.color === prevCell?.piece?.color
    ) {
      //click on the same cell or change piece to move
      showPosibleMove(to);
      return;
    }

    setPossibleMoves([]);
    //setMoveMakeFrom(prevCell);
    game.movePieceFromCellTo(prevCell, to);
    game.isInCheck(game.whoPlay);
    setPrevCell(null);
  };

  const handleClick = (cell: Cell) => {
    setCurrent(cell);

    if (prevCell && !prevCell.isEmpty) {
      makeMove(cell);
    } else {
      if (game.whoPlay.color !== cell.piece?.color) {
        return;
      }
      showPosibleMove(cell);
    }
  };

  return (
    <div className="container">
      <div className="board">
        {game.board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}${j}`}
              className={`cell ${
                (current === cell && !cell.isEmpty && "cell-target-piece") ||
                (moveMakeFrom === cell && "cell-target-piece")
              } ${cell.color}`}
              onClick={() => handleClick(cell)}
            >
              <div
                className={possibleMoves.includes(cell) ? "possible-moves" : ""}
              />
              {!cell.isEmpty && (
                <img
                  className="piece"
                  src={cell.piece?.img}
                  alt={cell.piece?.name}
                />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Board;
