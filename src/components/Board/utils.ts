import Game from "../../core/config/Game";
import { Bishop, Knight, Queen, Rook } from "../../core/config/pieces/piece.ts";
import Cell from "../../core/types/Cell";

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
  setPrevCell: SetterCell
) => {
  if (!from || to === from || to?.piece?.color === from?.piece?.color) {
    showPosibleMove(to, game, setPossibleMoves, setPrevCell);
    return;
  }

  setPossibleMoves([]);
  game.movePieceFromCellTo(from, to);
  setPrevCell(null);
};

const getImage = (type: string, colorChar0: string) =>
  `/images/pions/${type + colorChar0}.png`;

const setPromotion = (
  cell: Cell | null,
  code: string,
  game: Game,
  setPromotionModale: SetterBoolean
) => {
  if (!cell || !cell.piece || !game.toPromote) return;

  const color = cell.piece.color;
  console.log(cell);
  switch (code) {
    case "N":
      cell.piece = new Knight(color, getImage("N", color.charAt(0)));
      console.log("N");
      break;

    case "B":
      cell.piece = new Bishop(color, getImage("B", color.charAt(0)));
      console.log("B");
      break;

    case "R":
      cell.piece = new Rook(color, getImage("R", color.charAt(0)));
      console.log("R");
      break;
    case "Q":
      cell.piece = new Queen(color, getImage("Q", color.charAt(0)));
      console.log("Q");
      break;
  }
  game.toPromote = null;
  setPromotionModale(false);
};

export { showPosibleMove, makeMove, setPromotion };
