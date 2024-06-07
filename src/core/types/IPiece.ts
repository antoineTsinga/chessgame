import Cell from "./Cell";
import { BoardType, Color } from "./Type";

export default interface IPiece {
  id: number;
  color: Color;
  img: string;
  isFirstMove: boolean;
  name: string;
  code: string;
  value: number;
  enPassant: Cell | null;

  getPossiblesMove(from: Cell, board: BoardType): Cell[];
  getNeighbors(board: BoardType, row: number, col: number): Cell[];
}
