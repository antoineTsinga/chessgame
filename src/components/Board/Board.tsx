import React, { useEffect, useState } from "react";
import Cell from "../../core/types/Cell.ts";
import Game from "../../core/config/Game.ts";
import { makeMove, showPosibleMove } from "../../core/config/utils.ts";
import { Move } from "../../core/types/Type.ts";
import "./Board.css";
import { ImagesLoader } from "../../core/config/ImagesLoader.ts";

export interface BoardProps {
  game: Game;
  setMove: React.Dispatch<React.SetStateAction<Move | null>>;
  startGame: boolean;
}

const imageLoader = ImagesLoader.instance;

const Board: React.FC<BoardProps> = ({ game, setMove, startGame }) => {
  const [current, setCurrent] = useState<Cell | null>(null);
  const [prevCell, setPrevCell] = useState<Cell | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Cell[]>([]);
  const [moveMade, setMoveMade] = useState<Cell[]>([]);
  const [promotionModale, setPromotionModale] = useState<boolean>(false);
  const [inPiece, setInPiece] = useState(null);
  const handleClick = (cell: Cell) => {
    if (promotionModale) return;
    if (game.isGameOver()) return;
    if (!game.isGameStart) return;
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
    const lastMove = game.currentState;

    if (lastMove && lastMove.currentMove) {
      setMoveMade([
        game.board[lastMove.currentMove[0].row][lastMove.currentMove[0].column],
        game.board[lastMove.currentMove[1].row][lastMove.currentMove[1].column],
      ]);
    }
  }, [game, game.currentState]);

  const setPromotionCall = (cell: Cell | null, code: string) => {
    if (prevCell === null || cell === null) return;

    const move = {
      from: [prevCell.row, prevCell.column],
      to: [cell.row, cell.column],
      promotion: code,
      time: game.getTimer(game.whoPlay),
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

  const handleDragStart = (element, cell) => {
    setPrevCell(cell);
    setTimeout(() => {
      element.target.style.display = "none";
    }, 0);
  };
  const handleDragEnd = (element) => {
    element.target.style.display = "block";
  };

  const handleDrop = (e, cell: Cell) => {
    e.target.style.border = "unset";
    handleClick(cell);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };
  const handleDragEnter = (e, cell: Cell) => {
    e.stopPropagation();
    e.preventDefault();
    let element = !e.target.classList.contains("cell")
      ? e.target.parentElement
      : e.target;
    if (!cell.isEmpty && cell.piece?.color === prevCell?.piece?.color) return;

    if (inPiece == null) {
      element.style.border = "4px solid rgb(211, 212, 201)";
      setInPiece(element);
    } else if (element !== inPiece) {
      inPiece.style.border = "unset";
      element.style.border = "4px solid rgb(211, 212, 201)";
      setInPiece(element);
    }
  };

  return (
    <div className="container">
      <div className={`board ${game.player1.color === "black" && "reverse"}`}>
        {game.board.map((row, i) =>
          row.map((cell, j) => (
            <div
              key={`${i}${j}`}
              className={`cell ${
                isMoveInMade(cell) && cell.color + "-move-made"
              } ${cell.color} `}
              onClick={() => handleClick(cell)}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, cell)}
              onDrop={(e) => handleDrop(e, cell)}
            >
              <div />
              {!cell.isEmpty && (
                <img
                  draggable={true}
                  onDragStart={(e) => handleDragStart(e, cell)}
                  onDragEnd={handleDragEnd}
                  className={`piece ${
                    game.player1.color === "black" && " reverse"
                  }`}
                  src={imageLoader.getImageByClass(cell.piece)}
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

      {promotionModale && game.toPromote ? (
        <>
          <div className="promotion-background"></div>
          <div className="promotion">
            <img
              className="piece"
              src={imageLoader.getImageByName(`${game.whoPlay.color}_knight`)}
              alt={"Knight"}
              onClick={() => setPromotionCall(game.toPromote, "N")}
            />
            <img
              className="piece"
              src={imageLoader.getImageByName(`${game.whoPlay.color}_bishop`)}
              alt={"Bishop"}
              onClick={() => setPromotionCall(game.toPromote, "B")}
            />
            <img
              className="piece"
              src={imageLoader.getImageByName(`${game.whoPlay.color}_rook`)}
              alt={"Rook"}
              onClick={() => setPromotionCall(game.toPromote, "R")}
            />
            <img
              className="piece"
              src={imageLoader.getImageByName(`${game.whoPlay.color}_queen`)}
              alt={"Queen"}
              onClick={() => setPromotionCall(game.toPromote, "Q")}
            />
          </div>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default Board;
