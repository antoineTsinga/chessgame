import { BoardType, Color } from "../types/Type";
import Player from "../types/Player.ts";
import { createBoard } from "./initialBoard.ts";
import IPiece from "../types/IPiece.ts";
import Cell from "../types/Cell.ts";
import { Bishop, Knight, Queen, Rook } from "./pieces/piece.ts";

export default class Game {
  player1: Player = new Player();
  player2: Player = new Player();
  hostCode: string;
  board: BoardType;
  history: string[] = [];
  isGameStart: boolean = false;
  winner: Player | null = null;
  turn: number = 1;
  whoPlay: Player;
  toPromote: Cell | null = null;
  LastFiftyMoveWithoutTake: number[] = [];
  timers: { black: number; white: number } = { black: 600, white: 600 };
  takenPieces: { black: IPiece[]; white: IPiece[] } = { black: [], white: [] };
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

  fen(): string {
    return "";
  }
  getOpponent(player: Player): Player {
    return this.player1 === player ? this.player2 : this.player1;
  }

  getTimer(player: Player): number {
    return this.timers[player.color];
  }

  isGameOver(): boolean {
    this.setWinner();
    return (
      this.isCheckMat(this.player1) ||
      this.isCheckMat(this.player2) ||
      this.isNull() ||
      this.timers.black <= 0 ||
      this.timers.white <= 0
    );
  }

  setWinner(): void {
    if (this.isCheckMat(this.player1) || this.timers[this.player1.color] <= 0) {
      this.winner = this.player2;
    }
    if (this.isCheckMat(this.player2) || this.timers[this.player2.color] <= 0) {
      this.winner = this.player1;
    }
  }
  getWinner(): Player | null {
    return this.winner;
  }

  reMatch(): void {
    if (this.player1.color === "black") {
      this.player1.color = "white";
      this.player2.color = "black";
      this.whoPlay = this.player1;
    } else {
      this.player2.color = "white";
      this.player1.color = "black";
      this.whoPlay = this.player2;
    }
    this.board = createBoard();
    this.history = [];
    this.isGameStart = true;
    this.winner = null;
    this.turn = 1;
    this.toPromote = null;
    this.LastFiftyMoveWithoutTake = [];
    this.takenPieces = { black: [], white: [] };
    this.timers = { black: 600, white: 600 };
  }

  getkingCell(color: Color): Cell {
    const kingCell = this.board[this.kingPos[color][0]][this.kingPos[color][1]];
    return kingCell;
  }

  isCheckMat(player: Player): boolean {
    let onePieceCanMove = false;

    this.leftPieceTo(player).map((cell) => {
      onePieceCanMove = onePieceCanMove || this.canMove(cell);
      return 0;
    });
    return this.isInCheck(player) && !onePieceCanMove;
  }

  noPieceCanMove(player: Player): boolean {
    let noPieceCanMove = true;
    this.leftPieceTo(player).forEach((cell) => {
      noPieceCanMove = noPieceCanMove && !this.canMove(cell);
    });

    return noPieceCanMove;
  }

  canMove(cell: Cell): boolean {
    const possibleMoves = this.possibleMoveFrom(cell);
    return possibleMoves.length > 0;
  }

  leftPieceTo(player: Player): Cell[] {
    const leftPieces: Cell[] = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (
          this.board[i][j].piece &&
          this.board[i][j].piece?.color === player.color
        ) {
          leftPieces.push(this.board[i][j]);
        }
      }
    }

    return leftPieces;
  }

  totalLeftPieces() {
    return (
      this.leftPieceTo(this.player1).length +
      this.leftPieceTo(this.player2).length
    );
  }

  isNull(): boolean {
    return (
      this.isPat() ||
      this.notEnougthMaterial() ||
      this.isRepetition() ||
      this.isFiftyMoveWithoutTake()
    );
  }
  isPat(): boolean {
    return (
      this.noPieceCanMove(this.player1) || this.noPieceCanMove(this.player2)
    );
  }

  notEnougthMaterial(): boolean {
    const notEnougthMaterials: (string | undefined)[] = [
      "K",
      "KN",
      "NK",
      "KB",
      "BK",
    ];

    const leftPiecesPlayer1 = this.leftPieceTo(this.player1).map(
      (cell) => cell.piece?.code
    );

    const leftPiecesPlayer2 = this.leftPieceTo(this.player2).map(
      (cell) => cell.piece?.code
    );

    return (
      notEnougthMaterials.includes(leftPiecesPlayer1.join("")) &&
      notEnougthMaterials.includes(leftPiecesPlayer2.join(""))
    );
  }

  takeEnPassant(from: Cell, to: Cell): void {
    from.piece.enPassant = null;
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

  isRepetition(): boolean {
    const state: string = this.stringifyBoard();
    const repetitions = this.history.filter(
      (position) => position === state
    ).length;

    return repetitions >= 3; //there are already 2 states equal to the current state in history so it's repetion
  }

  stringifyBoard(): string {
    return JSON.stringify(
      this.board.map((rows) =>
        rows.map((cell) => {
          if (cell.isEmpty) {
            return "X";
          } else {
            return cell.piece?.code;
          }
        })
      )
    );
  }

  isFiftyMoveWithoutTake(): boolean {
    return (
      this.LastFiftyMoveWithoutTake.length >= 50 &&
      this.LastFiftyMoveWithoutTake.filter(
        (leftPiece) => leftPiece !== this.LastFiftyMoveWithoutTake[0]
      ).length === 0
    );
  }

  isPromotion(from: Cell, to: Cell): boolean {
    if (
      this.isValidMove(from, to) &&
      from.piece?.code === "P" &&
      (to.row === 0 || to.row === 7)
    ) {
      this.toPromote = to;

      return true;
    }

    return false;
  }

  changeTurn() {
    this.whoPlay = this.whoPlay === this.player1 ? this.player2 : this.player1;
  }

  possibleMoveFrom(cell: Cell) {
    if (cell.piece == null) {
      return [];
    }
    let possibleMoves = cell.piece?.getPossiblesMove(cell, this.board);

    if (cell.piece.enPassant != null) {
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

  isValidMove(from: Cell, to: Cell): boolean {
    const possibleMoves = this.possibleMoveFrom(from);
    return possibleMoves?.includes(to);
  }
  movePieceFromCellTo(
    from: Cell,
    to: Cell,
    promotion: string | null = null
  ): boolean {
    if (!from.piece || !this.isValidMove(from, to)) return false;

    to.piece && this.takenPieces[to.piece.color].push(to.piece); // add in stack when taken pieces

    if (from.piece.code === "P") {
      this.makePawnMove(from, to, promotion);
    } else if (
      from.piece.code === "K" &&
      Math.abs(from.column - to.column) === 2 // move from two cells roque
    ) {
      this.makeRoqueMove(from, to);
    } else {
      from.movePieceTo(to);
    }

    if (
      this.LastFiftyMoveWithoutTake.length > 0 &&
      this.LastFiftyMoveWithoutTake[0] === this.totalLeftPieces()
    ) {
      this.LastFiftyMoveWithoutTake.push(this.totalLeftPieces());
    } else {
      this.LastFiftyMoveWithoutTake = [this.totalLeftPieces()];
    }

    this.history.push(this.stringifyBoard());

    this.changeTurn(); //change turn

    if (to.piece?.code === "K") {
      //update king position
      this.kingPos[to.piece.color] = [to.row, to.column];
    }

    if (this.isGameOver()) {
      this.setWinner();
    }
    return true;
  }

  makePawnMove(from: Cell, to: Cell, promotion: string | null = null) {
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
      this.takeEnPassant(from, to);
    } else {
      //after a move enPassent can no longer be possible to the same pawn
      from.piece.enPassant = null;
      from.movePieceTo(to);
    }

    if (promotion) {
      this.setPromotion(to, promotion);
    }
  }

  getImage = (type: string, colorChar0: string) =>
    `/images/pions/${type + colorChar0}.png`;

  setPromotion(cell: Cell, code: string) {
    const color = cell.piece.color;
    console.log(cell);
    switch (code) {
      case "N":
        cell.piece = new Knight(color, this.getImage("N", color.charAt(0)));
        console.log("N");
        break;

      case "B":
        cell.piece = new Bishop(color, this.getImage("B", color.charAt(0)));
        console.log("B");
        break;

      case "R":
        cell.piece = new Rook(color, this.getImage("R", color.charAt(0)));
        console.log("R");
        break;
      case "Q":
        cell.piece = new Queen(color, this.getImage("Q", color.charAt(0)));
        console.log("Q");
        break;
    }
    this.toPromote = null;
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
