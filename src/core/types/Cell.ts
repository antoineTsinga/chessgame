import IPiece from "./IPiece";
import { BoardType, Color } from "./Type";

export default class Cell {
  row: number;
  column: number;
  piece: IPiece | null = null;
  color: Color;
  // board: BoardType;

  constructor(row: number, col: number, color: Color) {
    this.row = row;
    this.column = col;
    this.color = color;
    // this.board = board;
  }

  movesPossible(board: BoardType): Cell[] {
    if (this.piece == null) {
      return [];
    }
    return this.piece.getPossiblesMove(this, board);
  }

  movePieceTo(cell: Cell): boolean {
    if (this.piece == null) {
      return false;
    }

    this.piece.isFirstMove = false;
    cell.piece = this.piece;
    this.piece = null;
    return true;
  }

  get isEmpty() {
    return this.piece == null;
  }
}
