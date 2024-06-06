import Game from "../config/Game";
import Cell from "./Cell";

export type Color = "white" | "black";
export type BoardType = Cell[][];

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
