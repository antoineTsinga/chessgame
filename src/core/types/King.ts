import Cell from "./Cell";
import IPiece from "./IPiece";
import { BoardType, Color } from "./Type";

export default class King implements IPiece {
  color: Color;
  img: string;
  isFirstMove: boolean = true;
  name: string = "King";
  code: string = "K";
  value: number = 0;
  enPassant: Cell | null;

  constructor(color: Color, img: string) {
    this.color = color;
    this.img = img;
  }
  getNeighbors(board: BoardType, row: number, col: number): Cell[] {
    return [];
  }

  isfirstMove: boolean;

  getPossiblesMove(from: Cell, board: BoardType): Cell[] {
    const ans: Cell[] = [];
    const directions = [
      [0, 1],
      [0, -1],
      [1, 0],
      [1, 1],
      [1, -1],
      [-1, 0],
      [-1, 1],
      [-1, -1],
    ];

    for (const [dx, dy] of directions) {
      const next_row = from.row + dy;
      const next_col = from.column + dx;

      if (!(0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8)) {
        continue;
      }

      if (board[next_row][next_col].isEmpty) {
        ans.push(board[next_row][next_col]);
      } else {
        if (from.piece?.color !== board[next_row][next_col].piece?.color) {
          ans.push(board[next_row][next_col]);
        }
      }
    }

    return ans.concat(this.roque(from, board));
  }

  roque(from: Cell, board: BoardType): Cell[] {
    if (!this.isFirstMove) return [];

    const possibleMoves: Cell[] = [];
    const directions = [-2, 2]; // two move possible bigrook and small rook

    for (const dx of directions) {
      const direction = Math.abs(dx) / dx; // Direction of movement

      let next_col = from.column + direction;
      while (0 < next_col && next_col < 7) {
        //Check if not piece between king and rook
        if (!board[from.row][next_col].isEmpty) {
          break;
        }

        next_col += direction;
      }

      const cellRook = board[from.row][next_col]; // it might not be the rook cell

      if (
        [0, 7].includes(next_col) && //check if it is a rook cell
        !cellRook.isEmpty &&
        cellRook.piece?.isFirstMove
      ) {
        possibleMoves.push(board[from.row][from.column + dx]);
      }
    }

    return possibleMoves;
  }
}
