import IPiece from "./IPiece";
import { BoardType, Color } from "./Type";

export default class Cell {
  row: number;
  column: number;
  piece: IPiece | null = null;
  color: Color;
  board: BoardType;

  constructor(row: number, col: number, color: Color, board: BoardType) {
    this.row = row;
    this.column = col;
    this.color = color;
    this.board = board;
  }

  movesPossible(): Cell[] {
    if (this.piece == null) {
      return [];
    }
    return this.piece.getPossiblesMove(this, this.board);
  }

  movePieceTo(cell: Cell): boolean {
    const possible = this.piece?.getPossiblesMove(this, this.board);
    if (this.piece == null || !possible?.includes(cell)) {
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
