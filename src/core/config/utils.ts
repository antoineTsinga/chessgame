import Game from "./Game.ts";

import Cell from "../types/Cell.ts";
import { Move } from "../types/Type.ts";

type SetterListCell = (moves: Cell[]) => void;

type SetterCell = (cell: Cell | null) => void;
type SetterBoolean = (value: boolean) => void;

/**
 * Show possibles moves that a the piece in a specific can make
 * @param cell cell contening the piece we want to see move
 * @param game game manager
 * @param setPossibleMoves setter to update the state
 * @param setPrevCell setter to update the state
 */
const showPosibleMove = (
  cell: Cell,
  game: Game,
  setPossibleMoves: SetterListCell,
  setPrevCell: SetterCell
) => {
  setPossibleMoves(game.possibleMoveFrom(cell));
  setPrevCell(cell);
};

/**
 * Move piece from cell to an other one
 * @param from
 * @param to
 * @param promotion
 * @param game
 * @param setPossibleMoves
 * @param setPrevCell
 * @returns
 */
const makeMove = (
  from: Cell,
  to: Cell,
  game: Game,
  setPossibleMoves: SetterListCell,
  setPrevCell: SetterCell,
  setCurrentPlayerMove: React.Dispatch<React.SetStateAction<Move | null>>
) => {
  if (!from || to === from || to?.piece?.color === from?.piece?.color) {
    showPosibleMove(to, game, setPossibleMoves, setPrevCell);
    return;
  }
  setPossibleMoves([]);

  const move = {
    from: [from.row, from.column],
    to: [to.row, to.column],
    promotion: null,
    timer: game.getTimer(game.whoPlay),
  };

  setCurrentPlayerMove(move);
  setPrevCell(null);
};

export { showPosibleMove, makeMove };
