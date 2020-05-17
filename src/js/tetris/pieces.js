const T = [
  [0, 0, 0],
  [1, 1, 1],
  [0, 1, 0]
];

const I = [
  [0, 2, 0, 0],
  [0, 2, 0, 0],
  [0, 2, 0, 0],
  [0, 2, 0, 0]
];

const L = [
  [0, 3, 0],
  [0, 3, 0],
  [0, 3, 3]
];

const J = [
  [0, 4, 0],
  [0, 4, 0],
  [4, 4, 0]
];

const O = [
  [5, 5],
  [5, 5],
];

const S = [
  [0, 0, 0],
  [0, 6, 6],
  [6, 6, 0]
];

const Z = [
  [0, 0, 0],
  [7, 7, 0],
  [0, 7, 7]
];

export const piecesColors = [
  '#202020',
  '#ff5714', // T
  '#eeb902', // I
  '#bce156', // Z
  '#5677e1', // S
  '#006ba6', // L
  '#f6ae2d', // J
  '#592e83' // O
];

export function getRandomPiece() {
  const pieces = [T, I, Z, S, L, J, O];
  const index = Math.floor(Math.random() * pieces.length);
  return pieces[index];
}
