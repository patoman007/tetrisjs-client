import { piecesColors } from './pieces.js';
import emptyMatrix from '../utils.js';
import EventsManager, {} from '../managers/EventsManager.js';

const PLAYER_COORDINATES = {
  x: 'x',
  y: 'y'
};

export const PLAYER_EVENTS = {
  position: {
    hasChanged: 'position-has-changed'
  },
  piece: {
    hasChanged: 'piece-has-changed'
  }
};

export default class Player {

  constructor(piece) {
    this.name = null;
    this.position = { x: 0, y: 0 };
    this.eventsManager = new EventsManager();

    if (piece != null) {
      this.setPiece(piece);
    }
  }

  _draw(context) {
    if (this.piece == null) { return; }

    const offsetX = this.position.x;
    const offsetY = this.position.y;

    this.piece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 0) { return; }

        context.strokeStyle = piecesColors[0];
        context.fillStyle = piecesColors[value];
        context.lineWidth = 0.05;

        context.fillRect(offsetX + x, offsetY + y, 1, 1);
        context.strokeRect(offsetX + x, offsetY + y, 1, 1);
      });
    });
  }

  _emitPositionHasChangedEvent() {
    this.eventsManager.emit(PLAYER_EVENTS.position.hasChanged, this.position);
  }

  _emitPieceHasChangedEvent() {
    this.eventsManager.emit(PLAYER_EVENTS.piece.hasChanged, this.piece);
  }

  _getPieceLeftBound() {
    if (this.piece === null) { return 0; }

    const offsets = this.piece
      .map((row) => {
        const index = row.findIndex((value) => value > 0);
        return index >= 0 ? index : 0;
      });

    return Math.min(...offsets);
  }

  _getPieceRightBound() {
    if (this.piece == null) { return 0; }

    const offsets = this.piece
      .map((row) => {
        const lastIndex = [...row].reverse().findIndex(value => value > 0);
        const index = lastIndex >= 0 ? (row.length - lastIndex) : 0;
        return index > 0 ? index : 0;
      });

    return Math.max(...offsets);
  }

  _getPieceBottomDown() {
    if (this.piece == null) { return 0; }

    const offsets = this.piece
      .map((row, y) => {
        return row.some((value) => value > 0) ? y : 0;
      });

    return Math.max(...offsets);
  }

  _updatePosition(coordinate, distance) {
    if (this.position[coordinate] == null) {
      console.warn(`Coordinate ${coordinate} is not valid`);
      return;
    }

    this.position[coordinate] += distance;
    this._emitPositionHasChangedEvent();
  }

  drawBorder(context, lineWidth = 0.08) {
    if (this.piece == null) { return; }

    context.lineWidth = lineWidth;

    this.piece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 0) { return; }

        const offsetX = this.position.x + x;
        const offsetY = this.position.y + y;
        context.strokeStyle = piecesColors[value];
        context.strokeRect(offsetX, offsetY, 1, 1);
      });
    });
  }

  getLeftBound() {
    this.position.x - this._getPieceLeftBound();
  }

  getRightBound() {
    return this.position.x + this._getPieceRightBound();
  }

  getBottomBound() {
    return this.position.y + this._getPieceBottomDown();
  }

  moveToLeft() {
    this._updatePosition(PLAYER_COORDINATES.x, -1);
  }

  moveToRight() {
    this._updatePosition(PLAYER_COORDINATES.x, 1);
  }

  moveDown() {
    this._updatePosition(PLAYER_COORDINATES.y, 1);
  }

  on(eventName, callback) {
    this.eventsManager.subscribe(eventName, callback);
  }

  setPiece(piece) {
    this.piece = piece;
    this._emitPieceHasChangedEvent();
  }

  shrinkPieceToLeft() {
    this.piece
      .forEach((row) => {
        const firstElement = row.shift(row);
        row.push(firstElement);
      });
    this._emitPieceHasChangedEvent();
  }

  shrinkPieceToRight() {
    this.piece
      .forEach((row) => {
        const lastElement = row.pop();
        row.unshift(lastElement);
      });
    this._emitPieceHasChangedEvent();
  }

  rotate(clockwise = true) {
    const rows = this.piece.length;
    const cols = this.piece[0].length;
    const rotatedPiece = emptyMatrix(rows, cols);

    this.piece.forEach((row, y) => {
      row.forEach((value, x) => {
        rotatedPiece[x][y] = value;
      });
    });

    if (clockwise) {
      rotatedPiece.forEach((row) => row.reverse());
    } else {
      rotatedPiece.reverse();
    }

    this.piece = rotatedPiece;
    this._emitPieceHasChangedEvent();
  }

  update(context) {
    this._draw(context);
  }

}
