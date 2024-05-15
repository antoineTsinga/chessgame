import React, { useState } from "react";
import "./Board.css";
import { createBoard } from "../../core/config/initialBoard.ts";
import Cell from "../../core/types/Cell.ts";
import Game from "../../core/config/Game.ts";

const initialBoard = createBoard();

interface BoardProps {
  game: Game;
}

const Board: React.FC<BoardProps> = ({ game }) => {
  const [current, setCurrent] = useState<Cell | null>(null);
  const [prevCell, setPrevCell] = useState<Cell | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Cell[]>([]);
  const [moveMakeFrom, setMoveMakeFrom] = useState<Cell | null>(null);

  const showPosibleMove = (from: Cell) => {
    setPossibleMoves(from.movesPossible());
    setPrevCell(from);
  };

  const makeMove = (to: Cell) => {
    if (to === prevCell || to?.piece?.color === prevCell?.piece?.color) {
      showPosibleMove(to);
      return;
    }

    setPossibleMoves([]);
    setMoveMakeFrom(prevCell);

    //game.movePieceFromCellTo(prevCell, to);
    prevCell?.movePieceTo(to);
    setPrevCell(null);
  };

  const handleClick = (cell: Cell) => {
    setCurrent(cell);

    if (prevCell && !prevCell.isEmpty) {
      makeMove(cell);
    } else {
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
