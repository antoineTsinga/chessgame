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
  whoPlay: Player;
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
    this.player2.color = color[1 - random];

    this.whoPlay = random === 0 ? this.player1 : this.player2;
    this.hostCode = Math.random().toString();

    this.board = createBoard();
  }

  IsGameOver(): boolean {
    return (
      this.isCheckMat(this.player1) ||
      this.isCheckMat(this.player2) ||
      this.isNull()
    );
  }

  getkingCell(color: Color): Cell {
    const kingCell = this.board[this.kingPos[color][0]][this.kingPos[color][1]];
    return kingCell;
  }

  isCheckMat(player: Player): boolean {
    return false;
  }

  isNull(): boolean {
    return false;
  }
  isPat(): boolean {
    return false;
  }

  takeEnPassant(from: Cell, to: Cell): void {
    to.piece = from.piece;
    this.board[from.row][to.column].piece = null;
    from.piece = null;
  }

  isInCheck(player: Player): boolean {
    const kingCell: Cell = this.getkingCell(player.color);
    return (
      !this.noQueenOrBishopTargetingThisCellForKing(
        kingCell,
        kingCell,
        kingCell
      ) ||
      !this.noQueenOrRookTargetingThisCellForKing(
        kingCell,
        kingCell,
        kingCell
      ) ||
      !this.noPawnTargetingThisCellForKing(kingCell, kingCell, kingCell) ||
      !this.noKnightTargetingThisCellForKing(kingCell, kingCell, kingCell) ||
      !this.noKingTargetingThisCellForKing(kingCell, kingCell, kingCell)
    );
  }

  possibleMoveFrom(cell: Cell) {
    if (cell.piece == null) {
      console.log("empty piece");
      return [];
    }
    let possibleMoves = cell.piece?.getPossiblesMove(cell, this.board);

    if (cell.piece.enPassant) {
      const cellEnPassant =
        this.board[(cell.row + cell.piece.enPassant.row) / 2][
          cell.piece.enPassant.column
        ];
      possibleMoves.push(cellEnPassant);
    }

    possibleMoves = possibleMoves?.filter((to) =>
      this.kingIsSafeWhenPieceMoveFromTo(cell, to)
    );

    return possibleMoves;
  }

  movePieceFromCellTo(from: Cell, to: Cell): boolean {
    const possibleMoves = this.possibleMoveFrom(from);

    if (from.piece == null || !possibleMoves?.includes(to)) {
      return false;
    }

    if (from.piece.code === "P") {
      this.makePawnMove(from, to);
    } else if (
      from.piece.code === "K" &&
      Math.abs(from.column - to.column) === 2
    ) {
      //roque
      this.makeRoqueMove(from, to);
    } else {
      from.movePieceTo(to);
    }

    this.whoPlay = this.whoPlay === this.player1 ? this.player2 : this.player1;
    if (to.piece?.code === "K") {
      this.kingPos[to.piece.color] = [to.row, to.column];
    }
    return true;
  }

  makePawnMove(from: Cell, to: Cell) {
    if (
      (from.row === 6 && to.row === 4) || // some pieces can possibly make an enpassant
      (from.row === 1 && to.row === 3)
    ) {
      from.piece?.getNeighbors(this.board, to.row, to.column).map((cell) => {
        //add possible move to adjacent pawn
        cell.piece.enPassant = this.board[from.row][from.column];
      });
    }
    if (
      from.piece?.enPassant &&
      this.board[to.row][from.piece?.enPassant.column] === to
    ) {
      console.log("En passant");
      this.takeEnPassant(from, to);
    } else {
      //after a move enPassent can no longer be possible to the same pawn
      from.piece.enPassant = null;
      from.movePieceTo(to);
    }
  }

  makeRoqueMove(from: Cell, to: Cell) {
    from.movePieceTo(to);
    if (to.column === 6) {
      //"small roque"
      this.board[from.row][5].piece = this.board[from.row][7].piece;
      this.board[from.row][7].piece = null;
    }
    if (to.column === 2) {
      //"big roque"
      this.board[from.row][3].piece = this.board[from.row][0].piece;
      this.board[from.row][0].piece = null;
    }
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
      //check if there is no danger for the king to move to the cell "to"
      return (
        this.noQueenOrBishopTargetingThisCellForKing(to, from, to) &&
        this.noQueenOrRookTargetingThisCellForKing(to, from, to) &&
        this.noPawnTargetingThisCellForKing(to, from, to) &&
        this.noKnightTargetingThisCellForKing(to, from, to) &&
        this.noKingTargetingThisCellForKing(to, from, to)
      );
    } else {
      //check if move a piece don't put the king in danger
      return (
        this.noQueenOrBishopTargetingThisCellForKing(kingCell, from, to) &&
        this.noQueenOrRookTargetingThisCellForKing(kingCell, from, to) &&
        this.noPawnTargetingThisCellForKing(kingCell, from, to) &&
        this.noKnightTargetingThisCellForKing(kingCell, from, to)
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

    return this.noPieceWhiteManyMovesByDirection(
      directions,
      ["B", "Q"],
      kingCell,
      movingPieceFrom,
      movingPieceTo
    );
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

    return this.noPieceWhiteManyMovesByDirection(
      directions,
      ["R", "Q"],
      kingCell,
      movingPieceFrom,
      movingPieceTo
    );
  }

  /**
   * return false if the king is in danger targeting by a pawn after a move of the piece of same color
   * @param kingCell Cell where the king is after the move
   * @param movingPieceFrom Cell where the piece is before the move
   * @param movingPieceTo Cell where the piece is before the after the move
   * @returns
   */

  noPawnTargetingThisCellForKing(
    kingCell: Cell,
    movingPieceFrom: Cell,
    movingPieceTo: Cell
  ): boolean {
    const directions =
      movingPieceFrom.piece?.color === "white"
        ? [
            [1, -1],
            [-1, -1],
          ]
        : [
            [-1, 1],
            [1, 1],
          ];

    return this.noPieceWhiteOneMoveByDirection(
      directions,
      "P",
      kingCell,
      movingPieceFrom,
      movingPieceTo
    );
  }

  /**
   * return false if the king is in danger targeting by knight after a move of the piece of same color
   * @param kingCell Cell where the king is after the move
   * @param movingPieceFrom Cell where the piece is before the move
   * @param movingPieceTo Cell where the piece is before the after the move
   * @returns
   */

  noKnightTargetingThisCellForKing(
    kingCell: Cell,
    movingPieceFrom: Cell,
    movingPieceTo: Cell
  ): boolean {
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

    return this.noPieceWhiteOneMoveByDirection(
      directions,
      "N",
      kingCell,
      movingPieceFrom,
      movingPieceTo
    );
  }
  noKingTargetingThisCellForKing(
    kingCell: Cell,
    movingPieceFrom: Cell,
    movingPieceTo: Cell
  ): boolean {
    const directions = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
      [0, 1],
      [0, -1],
      [-1, 0],
      [1, 0],
    ];

    return this.noPieceWhiteOneMoveByDirection(
      directions,
      "K",
      kingCell,
      movingPieceFrom,
      movingPieceTo
    );
  }
  /**
   *  return false if the king is in danger targeting by a piece with one move by direction, after a move of the piece of same color
   * @param directions all possible direction from witch the king can get targeting by the piece
   * @param code the code of the piece targeting
   * @param kingCell Cell where the king is after the move
   * @param movingPieceFrom Cell where the piece is before the move
   * @param movingPieceTo Cell where the piece is before the after the move
   * @returns
   */
  noPieceWhiteOneMoveByDirection(
    directions: number[][],
    code: string,
    kingCell: Cell,
    movingPieceFrom: Cell,
    movingPieceTo: Cell
  ): boolean {
    for (const [dx, dy] of directions) {
      const next_row = kingCell.row + dy;
      const next_col = kingCell.column + dx;
      if (!(0 <= next_row && next_row < 8 && 0 <= next_col && next_col < 8)) {
        continue;
      }

      if (!this.board[next_row][next_col].isEmpty) {
        if (this.board[next_row][next_col] === movingPieceTo) {
          // piece can take to protege the king
          continue;
        }

        if (
          this.board[next_row][next_col].piece?.code === code &&
          movingPieceFrom.piece?.color !==
            this.board[next_row][next_col].piece?.color
        ) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   *  return false if the king is in danger targeting by a piece with many move by direction, after a move of the piece of same color
   * @param directions all possible direction from witch the king can get targeting by the piece
   * @param code the code of the piece targeting
   * @param kingCell Cell where the king is after the move
   * @param movingPieceFrom Cell where the piece is before the move
   * @param movingPieceTo Cell where the piece is before the after the move
   * @returns
   */
  noPieceWhiteManyMovesByDirection(
    directions: number[][],
    code: string[],
    kingCell: Cell,
    movingPieceFrom: Cell,
    movingPieceTo: Cell
  ): boolean {
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
          } else if (this.board[next_row][next_col] === movingPieceTo) {
            // piece can take to protege the king
            break;
          }

          if (
            movingPieceFrom.piece.color !==
              this.board[next_row][next_col].piece?.color &&
            code.includes(this.board[next_row][next_col].piece.code)
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
}
