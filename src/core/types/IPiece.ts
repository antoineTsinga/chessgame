import Cell from "./Cell";
import { BoardType, Color } from "./Type";

export default interface IPiece {
  color: Color;
  img: string;
  isFirstMove: boolean;
  name: string;
  code: string;

  getPossiblesMove(from: Cell, board: BoardType): Cell[];
}
