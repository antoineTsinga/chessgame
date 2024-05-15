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
    if (from.piece?.code === "K") {
      return (
        this.noQueenOrBishopTargetingThisCellForKing(from.piece, to) &&
        this.noQueenOrRookTargetingThisCellForKing(from.piece, to) &&
        this.noPawnTargetingThisCellForKing(from.piece.color, to)
      );
    } else {
    }
    return true;
  }

  noQueenOrBishopTargetingThisCellForKing(king: IPiece, from: Cell): boolean {
    const directions = [
      [1, -1],
      [-1, 1],
      [1, 1],
      [-1, -1],
    ];
    for (const [dx, dy] of directions) {
      let next_row = from.row;
      let next_col = from.column;
      while (0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8) {
        next_row += dy;
        next_col += dx;

        if (!(0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8)) {
          break;
        }

        if (!this.board[next_row][next_col].isEmpty) {
          if (this.board[next_row][next_col].piece === king) {
            // if we get back to the king juste continue to look for bishop or queen
            continue;
          }
          if (
            king.color !== this.board[next_row][next_col].piece?.color &&
            ["Q", "B"].includes(this.board[next_row][next_col].piece.code)
          ) {
            return false;
          } else {
            break;
          }
        }
      }
    }
    return true;
  }

  noQueenOrRookTargetingThisCellForKing(king: IPiece, from: Cell): boolean {
    const directions = [
      [0, -1],
      [0, 1],
      [1, 0],
      [-1, 0],
    ];
    for (const [dx, dy] of directions) {
      let next_row = from.row;
      let next_col = from.column;
      while (0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8) {
        next_row += dy;
        next_col += dx;

        if (!(0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8)) {
          break;
        }

        if (!this.board[next_row][next_col].isEmpty) {
          if (this.board[next_row][next_col].piece === king) {
            continue;
          }

          if (
            king.color !== this.board[next_row][next_col].piece?.color &&
            ["Q", "R"].includes(this.board[next_row][next_col].piece.code)
          ) {
            return false;
          } else {
            break;
          }
        }
      }
    }
    return true;
  }

  noPawnTargetingThisCellForKing(color: Color, from: Cell): boolean {
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
      const next_row = from.row + dy;
      const next_col = from.column + dx;
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
}
