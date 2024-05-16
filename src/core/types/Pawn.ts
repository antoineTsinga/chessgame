import Cell from "./Cell";
import IPiece from "./IPiece";
import { BoardType, Color } from "./Type";

export default class Pawn implements IPiece {
  color: Color;
  img: string;
  isFirstMove: boolean = true;
  name: string = "Pawn";
  code: string = "P";
  value: number = 1;
  enPassant: Cell | null = null;

  constructor(color: Color, img: string) {
    this.color = color;
    this.img = img;
  }

  getPossiblesMove(from: Cell, board: BoardType): Cell[] {
    const possibleMove: Cell[] = [];

    const directions =
      this.color === "white"
        ? [
            [0, -1],
            [1, -1],
            [-1, -1],
          ]
        : [
            [0, 1],
            [-1, 1],
            [1, 1],
          ];

    if (this.color === "white" && from.row === 6) {
      directions.push([0, -2]);
    }
    if (this.color === "black" && from.row === 1) {
      directions.push([0, 2]);
    }

    for (const [dx, dy] of directions) {
      const next_row = from.row + dy;
      const next_col = from.column + dx;

      if (this.validPawn(next_row, next_col, from, board)) {
        possibleMove.push(board[next_row][next_col]);
      }
    }

    return possibleMove;
  }
  validPawn = (
    row: number,
    col: number,
    from: Cell,
    board: BoardType
  ): boolean => {
    if (!(0 <= row && row < 8 && 0 <= col && col < 8)) {
      //out of bound
      return false;
    }

    if (board[row][col].piece) {
      // there is a piece on the targe cell (take in diagonale)
      if (from.piece?.color === board[row][col].piece?.color) {
        return false;
      }

      if (from.column === col) {
        return false;
      }
    } else {
      if (col !== from.column) {
        return false;
      } else {
        if (from.row === 6 && row === 4 && !board[5][col].isEmpty) {
          return false;
        }

        if (from.row === 1 && row === 3 && !board[2][col].isEmpty) {
          return false;
        }
      }
      return true;
    }

    return true;
  };

  getNeighbors(board: BoardType, row: number, col: number): Cell[] {
    const neighbors: Cell[] = [];

    if (
      col + 1 < 8 &&
      !board[row][col + 1].isEmpty &&
      board[row][col + 1].piece?.color !== this.code &&
      board[row][col + 1].piece?.code === "P"
    ) {
      neighbors.push(board[row][col + 1]);
    }

    if (
      col - 1 >= 0 &&
      !board[row][col - 1].isEmpty &&
      board[row][col - 1].piece?.color !== this.color &&
      board[row][col - 1].piece?.code === "P"
    ) {
      console.log("Mon voisin est ", board[row][col - 1]);

      neighbors.push(board[row][col - 1]);
    }

    console.log("list", neighbors);

    return neighbors;
  }
}
