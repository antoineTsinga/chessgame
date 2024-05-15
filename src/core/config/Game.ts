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

  movePieceFromCellTo(from: Cell, to: Cell): boolean {
    let possibleMoves = from.piece?.getPossiblesMove(from, this.board);
    possibleMoves?.filter((to) => this.kingIsSafeWhenPieceMoveFromTo(from, to));

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
    return true;
  }
}
