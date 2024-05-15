import Cell from "./Cell";
import IPiece from "./IPiece";
import { BoardType, Color } from "./Type";

export default class Knight implements IPiece {
  color: Color;
  img: string;
  isFirstMove: boolean = true;
  name: string = "Knight";
  code: string = "N";
  value: number = 3;

  constructor(color: Color, img: string) {
    this.color = color;
    this.img = img;
    this.isFirstMove = true;
  }

  getPossiblesMove(from: Cell, board: BoardType): Cell[] {
    const ans: Cell[] = [];
    const directions = [
      [2, 1],
      [2, -1],
      [1, 2],
      [1, -2],
      [-2, 1],
      [-2, -1],
      [-1, 2],
      [-1, -2],
    ];

    for (const [dx, dy] of directions) {
      const next_row = from.row + dy;
      const next_col = from.column + dx;

      if (this.valid(next_row, next_col, from, board)) {
        ans.push(board[next_row][next_col]);
      }
    }

    return ans;
  }

  valid = (row: number, col: number, from: Cell, board: BoardType) => {
    if (!(0 <= row && row < 8 && 0 <= col && col < 8)) {
      return false;
    }

    if (from.piece?.color === board[row][col].piece?.color) {
      return false;
    }

    return true;
  };
}
