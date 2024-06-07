import { DragOverlay, useDroppable } from "@dnd-kit/core";
import React, { useEffect } from "react";
import PieceComponent from "./PieceComponent";

export default function CellComponent({
  cell,
  isMoveInMade,
  possibleMoves,
  imageLoader,
  game,
  handleClick,
  setIsOverCell,
  setPrevCell,
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: `${cell.row}${cell.column}`,
  });
  const style = {
    color: isOver ? "green" : undefined,
    border: isOver ? "4px solid rgb(211, 212, 201)" : undefined,
  };
  //rgb(211, 212, 201)

  useEffect(() => {
    if (isOver) setIsOverCell(cell);
  }, [isOver]);
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`cell ${isMoveInMade(cell) && cell.color + "-move-made"} ${
        cell.color
      } `}
      onClick={() => handleClick(cell)}
    >
      <div />

      {!cell.isEmpty && (
        <PieceComponent
          imageLoader={imageLoader}
          game={game}
          cell={cell}
          handleClick={handleClick}
          setPrevCell={setPrevCell}
        />
      )}

      <div
        className={possibleMoves.includes(cell) ? "possible-moves" : ""}
      ></div>
    </div>
  );
}
