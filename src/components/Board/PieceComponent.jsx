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

  const handleDragStart = (event) => {
    const { clientX, clientY } = event;
    console.log({ clientX, clientY }, transform);

    // setInitialMousePosition({ x: clientX, y: clientY });
  };

  useEffect(() => {
    // console.log(node.current.parentElement);

    if (isDragging) {
      // console.log(transform);
      handleClick(cell);
    }
  }, [isDragging]);

  return (
    <img
      className={`piece`}
      src={imageLoader.getImageByClass(cell.piece)}
      alt={cell.piece?.name}
      ref={setNodeRef}
      // onClick={() => console.log("ici")}
      style={style}
      onDragStart={handleDragStart} // Ajouter l'écouteur d'événement pour détecter le début du glissement
      {...listeners}
      {...attributes}
    />
  );
}
