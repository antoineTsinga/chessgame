import { BoardType, Color } from "../types/Type";
import Player from "../types/Player.ts";
import { createBoard } from "./initialBoard.ts";
import IPiece from "../types/IPiece.ts";
import Cell from "../types/Cell.ts";

export default class Game {
  player1: Player = new Player();
  player2: Player = new Player();
  hostCode: string;
  board: BoardType;
  history: string[];
  gameOver: boolean = false;
  isGameStart: boolean = false;
  winner: Player | null = null;
  turn: number = 1;
  whoPlay: Player | null;
  takePieces: IPiece[];
  kingPos: { white: [number, number]; black: [number, number] } = {
    white: [7, 4],
    black: [0, 4],
  };

  constructor(namePlayer1: string) {
    const color: { 0: Color; 1: Color } = { 0: "white", 1: "black" };
    const random = Math.round(Math.random());
    this.player1.color = color[random];
    this.player1.name = namePlayer1;

    this.whoPlay = random === 0 ? this.player1 : this.player2;
    this.hostCode = Math.random().toString();

    this.board = createBoard();
  }

  IsGameOver(): boolean {
    return (
      this.isCheckMat(this.player1) ||
      this.isCheckMat(this.player2) ||
      this.isPat()
    );
  }

  isCheckMat(player1: Player): boolean {
    return false;
  }

  isPat(): boolean {
    return false;
  }

  possibleMoveFrom(cell: Cell) {
    if (cell.piece == null) {
      console.log("empty piece");
      return [];
    }
    let possibleMoves = cell.piece?.getPossiblesMove(cell, this.board);

    possibleMoves = possibleMoves?.filter((to) =>
      this.kingIsSafeWhenPieceMoveFromTo(cell, to)
    );

    return possibleMoves;
  }

  movePieceFromCellTo(from: Cell, to: Cell): boolean {
    let possibleMoves = from.piece?.getPossiblesMove(from, this.board);

    possibleMoves = possibleMoves?.filter((to) =>
      this.kingIsSafeWhenPieceMoveFromTo(from, to)
    );

    if (from.piece == null || !possibleMoves?.includes(to)) {
      return false;
    }

    from.movePieceTo(to);
    if (to.piece?.code === "K") {
      this.kingPos[to.piece.color] = [to.row, to.column];
    }
    return true;
  }

  reMatch(): void {
    this.board = createBoard();
    this.gameOver = false;
    this.isGameStart = true;
    this.winner = null;
    this.turn = 1;
    this.history = [];
    this.takePieces = [];
  }

  kingIsSafeWhenPieceMoveFromTo(from: Cell, to: Cell): boolean {
    const kingCell =
      this.board[this.kingPos[from.piece.color][0]][
        this.kingPos[from.piece.color][1]
      ];
    if (from.piece?.code === "K") {
      return (
        this.noQueenOrBishopTargetingThisCellForKing(to, from, to) &&
        this.noQueenOrRookTargetingThisCellForKing(to, from, to) &&
        this.noPawnTargetingThisCellForKing(from.piece.color, to) &&
        this.noKnightTargetingThisCellForKing(from.piece.color, to)
      );
    } else {
      //console.log("pos", this.kingPos[from.piece.color]);

      return (
        this.noQueenOrBishopTargetingThisCellForKing(kingCell, from, to) &&
        this.noQueenOrRookTargetingThisCellForKing(kingCell, from, to)
      );
    }
  }

  /**
   * return false if after the move the king is in danger targeting by a bishop or a queen
   * @param kingCell Cell where the king is after the move
   * @param movingPieceFrom Cell where the piece is before the move
   * @param movingPieceTo Cell where the piece is before the after the move
   * @returns
   */

  noQueenOrBishopTargetingThisCellForKing(
    kingCell: Cell,
    movingPieceFrom: Cell,
    movingPieceTo: Cell
  ): boolean {
    const directions = [
      [1, -1],
      [-1, 1],
      [1, 1],
      [-1, -1],
    ];

    for (const [dx, dy] of directions) {
      let next_row = kingCell.row;
      let next_col = kingCell.column;
      while (0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8) {
        next_row += dy;
        next_col += dx;

        if (!(0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8)) {
          break;
        }

        if (!this.board[next_row][next_col].isEmpty) {
          if (this.board[next_row][next_col] === movingPieceFrom) {
            // we supose that the piece had moved and there is no piece there
            continue;
          }

          if (
            movingPieceFrom.piece.color !==
              this.board[next_row][next_col].piece?.color &&
            ["Q", "B"].includes(this.board[next_row][next_col].piece.code)
          ) {
            return false;
          } else {
            break;
          }
        } else {
          if (this.board[next_row][next_col] === movingPieceTo) {
            // New position cover the king
            break;
          }
        }
      }
    }
    return true;
  }

  /**
   * return false if after the move the king is in danger targeting by a rook or a queen
   * @param kingCell Cell where the king is after the move
   * @param movingPieceFrom Cell where the piece is before the move
   * @param movingPieceTo Cell where the piece is before the after the move
   * @returns
   */
  noQueenOrRookTargetingThisCellForKing(
    kingCell: Cell,
    movingPieceFrom: Cell,
    movingPieceTo: Cell
  ): boolean {
    const directions = [
      [0, -1],
      [0, 1],
      [1, 0],
      [-1, 0],
    ];
    for (const [dx, dy] of directions) {
      let next_row = kingCell.row;
      let next_col = kingCell.column;
      while (0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8) {
        next_row += dy;
        next_col += dx;

        if (!(0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8)) {
          break;
        }

        if (!this.board[next_row][next_col].isEmpty) {
          if (this.board[next_row][next_col] === movingPieceFrom) {
            // we supose that the piece had moved and there is no piece there
            continue;
          }

          if (
            movingPieceFrom.piece.color !==
              this.board[next_row][next_col].piece?.color &&
            ["Q", "R"].includes(this.board[next_row][next_col].piece.code)
          ) {
            return false;
          } else {
            break;
          }
        } else {
          if (this.board[next_row][next_col] === movingPieceTo) {
            // New position cover the king
            break;
          }
        }
      }
    }
    return true;
  }

  /**
   * Check if there are no Pawns targeting a cell where king can possibly move on
   * @param color color of the king
   * @param movingPieceTo cell where the king want to move on
   * @returns
   */

  noPawnTargetingThisCellForKing(color: Color, movingPieceTo: Cell): boolean {
    const directions =
      color === "white"
        ? [
            [1, -1],
            [-1, -1],
          ]
        : [
            [-1, 1],
            [1, 1],
          ];

    for (const [dx, dy] of directions) {
      const next_row = movingPieceTo.row + dy;
      const next_col = movingPieceTo.column + dx;
      if (!(0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8)) {
        continue;
      }

      if (
        !this.board[next_row][next_col].isEmpty &&
        this.board[next_row][next_col].piece?.code === "P" &&
        color !== this.board[next_row][next_col].piece?.color
      ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check if there are no Knight targeting a cell where king can possibly move on
   * @param color color of the king
   * @param movingPieceTo cell where the king want to move on
   * @returns
   */

  noKnightTargetingThisCellForKing(color: Color, movingPieceTo: Cell): boolean {
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
      const next_row = movingPieceTo.row + dy;
      const next_col = movingPieceTo.column + dx;
      if (!(0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8)) {
        continue;
      }

      if (
        !this.board[next_row][next_col].isEmpty &&
        color !== this.board[next_row][next_col].piece?.color &&
        this.board[next_row][next_col].piece?.code === "N"
      ) {
        return false;
      }
    }

    return true;
  }
}
