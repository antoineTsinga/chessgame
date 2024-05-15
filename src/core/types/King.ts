import Cell from "./Cell";
import IPiece from "./IPiece";
import { BoardType, Color } from "./Type";

export default class King implements IPiece {
    color: Color;
    img: string;
    isFirstMove: boolean;
    name: string = "King";
    code: string = "K";
  
    constructor(color: Color, img: string) {
      this.color = color;
      this.img = img;
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
  
      return ans;
    }
  
    isMovePossible(to: Cell): boolean {
      return true;
    }
  }
  