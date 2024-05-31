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
  time: number;
};
