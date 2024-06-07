import React, { useEffect, useState } from "react";
import Cell from "../../core/types/Cell.ts";
import Game from "../../core/config/Game.ts";
import { makeMove, showPosibleMove } from "../../core/config/utils.ts";
import { BoardType, Move } from "../../core/types/Type.ts";
import "./Board.css";
import { ImagesLoader } from "../../core/config/ImagesLoader.ts";
import CellComponent from "./CellComponent.jsx";
import {
  DndContext,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

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
  const [isOverCell, setIsOverCell] = useState<Cell | null>(null);
  const [isDropped, setIsDropped] = useState(false);
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

  const handleDragEnd = (element) => {
    // console.log(element);
    if (element.over) {
      setIsDropped(true);
    }
  };

  useEffect(() => {
    if (isDropped && isOverCell) {
      handleClick(isOverCell);
    }
    setIsDropped(false);
  }, [isDropped]);
  function reverseGrid(table: BoardType) {
    return table
      .map((row) => row)
      .reverse()
      .map((row) => row.map((e) => e).reverse());
  }
  const sensors = useSensors(
    useSensor(TouchSensor, {}),
    useSensor(MouseSensor, {})
  );

  return (
    <div className="container">
      <DndContext
        modifiers={[restrictToWindowEdges]}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        collisionDetection={closestCenter}
      >
        <div className={`board`}>
          {game.player1.color === "white"
            ? game.board.map((row) =>
                row.map((cell) => (
                  <CellComponent
                    key={`${cell.row}${cell.column}`}
                    cell={cell}
                    isMoveInMade={isMoveInMade}
                    possibleMoves={possibleMoves}
                    imageLoader={imageLoader}
                    game={game}
                    handleClick={handleClick}
                    setIsOverCell={setIsOverCell}
                    setPrevCell={setPrevCell}
                  />
                ))
              )
            : reverseGrid(game.board).map((row) =>
                row.map((cell) => (
                  <CellComponent
                    key={`${cell.row}${cell.column}`}
                    cell={cell}
                    isMoveInMade={isMoveInMade}
                    possibleMoves={possibleMoves}
                    imageLoader={imageLoader}
                    game={game}
                    handleClick={handleClick}
                    setIsOverCell={setIsOverCell}
                    setPrevCell={setPrevCell}
                  />
                ))
              )}
        </div>
      </DndContext>
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
