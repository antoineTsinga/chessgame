import Cell from "../types/Cell.ts";
import { initialPositions } from "./variables/pieces.ts";

function createBoard() {
  const board = new Array<Cell[]>(8);

  for (let row = 0; row < 8; row++) {
    board[row] = new Array(8);
    for (let col = 0; col < 8; col++) {
      board[row][col] = new Cell(
        row,
        col,
        (row + col) % 2 === 1 ? "black" : "white"
      );
    }
  }

  for (let row in initialPositions) {
    for (let col = 0; col < 8; col++) {
      board[row][col].piece = initialPositions[row][col];
    }
  }
  return board;
}

export { createBoard };
