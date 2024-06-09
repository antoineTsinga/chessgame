import Game from "../config/Game";
import Cell from "./Cell";
import IPiece from "./IPiece";
import Player from "./Player";

export type Color = "white" | "black";
export type BoardType = Cell[][];
export type BoardTypeDTO = CellDTO[][];
type CellDTO = {
  row: number;
  column: number;
  piece: IPieceDTO | null;
  color: Color;
};
type IPieceDTO = {
  id: number;
  color: Color;
  img: string;
  isFirstMove: boolean;
  name: string;
  code: string;
  value: number;
  enPassant: Cell | null;
};
export interface BoardProps {
  game: Game;
}

export type Move = {
  from: number[];
  to: number[];
  promotion: string | null;
  timer: number;
  color: Color;
};

export type ReMatch = {
  request: boolean;
  requester: Color;
  response: boolean;
};

export enum MoveType {
  MOVE = "move",
  CASTLE = "castle",
  CAPTURE = "capture",
  PROMOTE = "promote",
  CHECK = "check",
  WRONG = "wrong",
}

export class NodeMove {
  state: Cell[] | null = null;
  prevState: NodeMove;
  nextState: NodeMove;
  type: MoveType = MoveType.MOVE;
  currentMove: Cell[] | null = null;
}

export type GameDTO = {
  player1: Player;
  player2: Player;
  hostCode: string;
  board: BoardTypeDTO;
  history: string[];
  isGameStart: boolean;
  isGameFinished: boolean;
  winner: Player | null;
  turn: number;
  whoPlay: Player;
  toPromote: Cell | null;
  LastFiftyMoveWithoutTake: number[];
  numberFullMoves: number;
  timers: { black: number; white: number };
  startTimeDate: number;
  takenPieces: { black: IPiece[]; white: IPiece[] };
  kingPos: { white: [number, number]; black: [number, number] };
};
