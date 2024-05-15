import { Bishop, King, Knight, Pawn, Queen, Rook } from "../pieces/piece.ts";

const whiteRook1 = new Rook("white", "/images/pions/Rw.png");
const whiteKnight1 = new Knight("white", "/images/pions/Nw.png");
const whiteBishop1 = new Bishop("white", "/images/pions/Bw.png");
const whiteQueen = new Queen("white", "/images/pions/Qw.png");
const whiteKing = new King("white", "/images/pions/Kw.png");
const whiteBishop2 = new Bishop("white", "/images/pions/Bw.png");
const whiteKnight2 = new Knight("white", "/images/pions/Nw.png");
const whiteRook2 = new Rook("white", "/images/pions/Rw.png");

const blackRook1 = new Rook("black", "/images/pions/Rb.png");
const blackRook2 = new Rook("black", "/images/pions/Rb.png");
const blackKnight1 = new Knight("black", "/images/pions/Nb.png");
const blackKnight2 = new Knight("black", "/images/pions/Nb.png");
const blackBishop1 = new Bishop("black", "/images/pions/Bb.png");
const blackBishop2 = new Bishop("black", "/images/pions/Bb.png");
const blackQueen = new Queen("black", "/images/pions/Qb.png");
const blackKing = new King("black", "/images/pions/Kb.png");

const whitePawn1 = new Pawn("white", "/images/pions/Pw.png");
const whitePawn2 = new Pawn("white", "/images/pions/Pw.png");
const whitePawn3 = new Pawn("white", "/images/pions/Pw.png");
const whitePawn4 = new Pawn("white", "/images/pions/Pw.png");
const whitePawn5 = new Pawn("white", "/images/pions/Pw.png");
const whitePawn6 = new Pawn("white", "/images/pions/Pw.png");
const whitePawn7 = new Pawn("white", "/images/pions/Pw.png");
const whitePawn8 = new Pawn("white", "/images/pions/Pw.png");

const blackPawn1 = new Pawn("black", "/images/pions/Pb.png");
const blackPawn2 = new Pawn("black", "/images/pions/Pb.png");
const blackPawn3 = new Pawn("black", "/images/pions/Pb.png");
const blackPawn4 = new Pawn("black", "/images/pions/Pb.png");
const blackPawn5 = new Pawn("black", "/images/pions/Pb.png");
const blackPawn6 = new Pawn("black", "/images/pions/Pb.png");
const blackPawn7 = new Pawn("black", "/images/pions/Pb.png");
const blackPawn8 = new Pawn("black", "/images/pions/Pb.png");

const initialPositions = {
  0: [
    blackRook1,
    blackKnight1,
    blackBishop1,
    blackQueen,
    blackKing,
    blackBishop2,
    blackKnight2,
    blackRook2,
  ],
  1: [
    blackPawn1,
    blackPawn2,
    blackPawn3,
    blackPawn4,
    blackPawn5,
    blackPawn6,
    blackPawn7,
    blackPawn8,
  ],
  6: [
    whitePawn1,
    whitePawn2,
    whitePawn3,
    whitePawn4,
    whitePawn5,
    whitePawn6,
    whitePawn7,
    whitePawn8,
  ],
  7: [
    whiteRook1,
    whiteKnight1,
    whiteBishop1,
    whiteQueen,
    whiteKing,
    whiteBishop2,
    whiteKnight2,
    whiteRook2,
  ],
};

export { initialPositions };
