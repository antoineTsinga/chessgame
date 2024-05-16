import React, { useEffect, useState } from "react";
import "./Board.css";

import Cell from "../../core/types/Cell.ts";
import Game from "../../core/config/Game.ts";
import Knight from "../../core/types/Knight.ts";
import Bishop from "../../core/types/Bishop.ts";
import Rook from "../../core/types/Rook.ts";
import Queen from "../../core/types/Queen.ts";
import IPiece from "../../core/types/IPiece.ts";

interface BoardProps {
  game: Game;
}

const Board: React.FC<BoardProps> = ({ game }) => {
  const [current, setCurrent] = useState<Cell | null>(null);
  const [prevCell, setPrevCell] = useState<Cell | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Cell[]>([]);
  const [moveMakeFrom, setMoveMakeFrom] = useState<Cell | null>(null);
  const [checkMessage, setCheckMessage] = useState<string>("");
  const [promotionModale, setPromotionModale] = useState<boolean>(false);

  const showPosibleMove = (from: Cell) => {
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

  useEffect(() => {
    if (game.toPromote) setPromotionModale(true);
  }, [current]);
  const getImage = (type: string, colorChar0: string) =>
    `/images/pions/${type + colorChar0}.png`;

  const setPromotion = (cell: Cell | null, code: string) => {
    if (!cell || !cell.piece || !game.toPromote) return;

    const color = cell.piece.color;
    console.log(cell);
    switch (code) {
      case "N":
        cell.piece = new Knight(color, getImage("N", color.charAt(0)));
        console.log("N");
        break;

      case "B":
        cell.piece = new Bishop(color, getImage("B", color.charAt(0)));
        console.log("B");
        break;

      case "R":
        cell.piece = new Rook(color, getImage("R", color.charAt(0)));
        console.log("R");
        break;
      case "Q":
        cell.piece = new Queen(color, getImage("Q", color.charAt(0)));
        console.log("Q");
        break;
    }
    game.toPromote = null;
    setPromotionModale(false);
  };

  return (
    <div className="container">
      <h1>{checkMessage}</h1>
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

      {promotionModale && game.toPromote && game.toPromote.piece ? (
        <div className="promotion">
          <img
            className="piece"
            src={`/images/pions/N${game.toPromote.piece.color.charAt(0)}.png`}
            alt={"Knight"}
            onClick={() => setPromotion(game.toPromote, "N")}
          />
          <img
            className="piece"
            src={`/images/pions/B${game.toPromote.piece.color.charAt(0)}.png`}
            alt={"Bishop"}
            onClick={() => setPromotion(game.toPromote, "B")}
          />
          <img
            className="piece"
            src={`/images/pions/R${game.toPromote.piece.color.charAt(0)}.png`}
            alt={"Rook"}
            onClick={() => setPromotion(game.toPromote, "R")}
          />
          <img
            className="piece"
            src={`/images/pions/Q${game.toPromote.piece.color.charAt(0)}.png`}
            alt={"Queen"}
            onClick={() => setPromotion(game.toPromote, "Q")}
          />
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Board;
