// Importez les images
import blackKing from "./pions/black_king.png";
import blackQueen from "./pions/black_queen.png";
import blackBishop from "./pions/black_bishop.png";
import blackKnight from "./pions/black_knight.png";
import blackRook from "./pions/black_rook.png";
import blackPawn from "./pions/black_pawn.png";

import whiteKing from "./pions/white_king.png";
import whiteQueen from "./pions/white_queen.png";
import whiteBishop from "./pions/white_bishop.png";
import whiteKnight from "./pions/white_knight.png";
import whiteRook from "./pions/white_rook.png";
import whitePawn from "./pions/white_pawn.png";
import IPiece from "../types/IPiece";

export class ImagesLoader {
  static #instance: ImagesLoader;
  private images: { [key: string]: string } = {};

  private constructor() {
    this.loadImages();
  }

  public static get instance(): ImagesLoader {
    if (!ImagesLoader.#instance) {
      ImagesLoader.#instance = new ImagesLoader();
    }
    return ImagesLoader.#instance;
  }

  private loadImages(): void {
    // Charger les images dans l'objet `images`
    this.images["black_king"] = blackKing;
    this.images["black_queen"] = blackQueen;
    this.images["black_bishop"] = blackBishop;
    this.images["black_knight"] = blackKnight;
    this.images["black_rook"] = blackRook;
    this.images["black_pawn"] = blackPawn;

    this.images["white_king"] = whiteKing;
    this.images["white_queen"] = whiteQueen;
    this.images["white_bishop"] = whiteBishop;
    this.images["white_knight"] = whiteKnight;
    this.images["white_rook"] = whiteRook;
    this.images["white_pawn"] = whitePawn;
  }

  public getImageByName(name: string): string | undefined {
    return this.images[name];
  }

  public getImageByClass(piece: IPiece | null): string | undefined {
    if (!piece) return undefined;
    const name = `${piece.color}_${piece.name.toLocaleLowerCase()}`;
    return this.images[name];
  }
}
