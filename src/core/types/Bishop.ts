import  Cell  from "./Cell";
import IPiece from "./IPiece";
import { BoardType, Color } from "./Type";

export default class Bishop implements IPiece {
    color: Color;
    img: string;
    isFirstMove: boolean;
    name: string = "Bishop";
    code: string = "B";
  
    constructor(color: Color, img: string) {
      this.color = color;
      this.img = img;
    }
  
    getPossiblesMove(from: Cell, board: BoardType): Cell[] {
      const directions = [
        [1, -1],
        [-1, 1],
        [1, 1],
        [-1, -1],
      ];
      const ans: Cell[] = [];
  
      for (const [dx, dy] of directions) {
        let next_row = from.row;
        let next_col = from.column;
        while (0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8) {
          next_row += dy;
          next_col += dx;
  
          if (!(0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8)) {
            break;
          }
  
          if (board[next_row][next_col].isEmpty) {
            ans.push(board[next_row][next_col]);
          } else {
            if (from.piece?.color !== board[next_row][next_col].piece?.color) {
              ans.push(board[next_row][next_col]);
            }
            break;
          }
        }
      }
  
      return ans;
    }
    isMovePossible(to: Cell): boolean {
      return true;
    }
}
  