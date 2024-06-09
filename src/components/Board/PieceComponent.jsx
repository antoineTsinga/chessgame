import { useDraggable } from "@dnd-kit/core";
import { useEffect, useState } from "react";
export default function PieceComponent({
  imageLoader,
  game,
  cell,
  handleClick,
  setPrevCell,
}) {
  const [initialMousePosition, setInitialMousePosition] = useState({
    x: 0,
    y: 0,
  });
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: cell.piece.id,
      attributes: {},
    });
  const style = transform
    ? {
        transform: `translate3d(${transform.x - initialMousePosition.x}px, ${
          transform.y - initialMousePosition.y
        }px, 0)`,
        zIndex: 2,
      }
    : undefined;

  useEffect(() => {
    if (isDragging) {
      handleClick(cell);
    }
  }, [isDragging]);

  return (
    <img
      className={`piece`}
      src={imageLoader.getImageByClass(cell.piece)}
      alt={cell.piece?.name}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    />
  );
}
