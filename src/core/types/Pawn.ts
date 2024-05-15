import Cell from "./Cell";
import IPiece from "./IPiece";
import { BoardType, Color } from "./Type";

export default class Pawn implements IPiece {
    color: Color;
    img: string;
    isFirstMove: boolean;
    name: string = "Pawn";
    code: string = "";
  
    constructor(color: Color, img: string) {
      this.color = color;
      this.img = img;
      this.isFirstMove = true;
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
        return false;
      }
  
      if (board[row][col].piece) {
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
          if (row === 4 && !board[5][col].isEmpty) {
            return false;
          }
        }
        return true;
      }
  
      return true;
    };
  }