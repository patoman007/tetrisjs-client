import emptyMatrix from '../utils.js';
import { piecesColors } from './pieces.js';
import EventsManager from '../managers/EventsManager.js';

export const ARENA_EVENTS = {
  lines: {
    completed: 'lines-has-been-completed-event'
  },
  matrix: {
    hasChanged: 'matrix-has-changed-event'
  }
};

export default class Arena {

  constructor(rows = 20, cols = 12) {
    this.rows = rows;
    this.cols = cols;

    this.points = 0;
    this.linesCount = 0;
    this.doublesCount = 0;
    this.triplesCount = 0;
    this.tetrisCount = 0;
    this.matrix = emptyMatrix(rows, cols);

    this.eventsManager = new EventsManager();
  }

  _canPlayerMove(player, callback) {
    if (player.piece == null) { return false; }

    let canMove = true;

    player.piece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 0) { return; }

        const offsetY = player.position.y + y;
        const offsetX = player.position.x + x;
        canMove &= callback(offsetX, offsetY);
      });
    });

    return canMove;
  }

  _draw(context) {
    this.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        context.fillStyle = piecesColors[value];
        context.fillRect(x, y, 1, 1);
      });
    });
  }

  _emitLinesCompletedEvent(linesLength) {
    this.eventsManager.emit(ARENA_EVENTS.lines.completed, linesLength);
  }

  _emitMatrixHasChangedEvent() {
    this.eventsManager.emit(ARENA_EVENTS.matrix.hasChanged, [...this.matrix]);
  }

  _getCompletedLines(matrix) {
    return matrix
      .reduce((result, row, y) => {
        const nonEmptyValues = row.filter(value => value > 0);
        if (nonEmptyValues.length === row.length) {
          result.push(y);
        }

        return result;
      }, []);
  }

  _getEmptyRow() {
    return Array
      .from({ length: this.cols })
      .map(_ => 0);
  }

  _removeCompletedLines(matrix, completedLines) {
    completedLines.forEach(y => {
      matrix.splice(y, 1);
      matrix.unshift(this._getEmptyRow());
    });
  }

  _sweepLines(matrix) {
    const completedLines = this._getCompletedLines(matrix);
    const linesLength = completedLines.length;
    if (linesLength === 0) { return; }

    
    this.points += 10 * Math.pow(3, linesLength - 1);
    this.linesCount += linesLength;
    this.doublesCount += linesLength === 2 ? 1 : 0;
    this.triplesCount += linesLength === 3 ? 1 : 0;
    this.tetrisCount += linesLength === 4 ? 1 : 0;

    this._removeCompletedLines(matrix, completedLines);

    this._emitLinesCompletedEvent(linesLength);
    this._emitMatrixHasChangedEvent();
  }

  canPlayerMoveToLeft(player) {
    if (player.getLeftBound() === 0) { return false; }

    const callback = (offsetX, offsetY) => this.matrix[offsetY][offsetX - 1] === 0;
    return this._canPlayerMove(player, callback);
  }

  canPlayerMoveToRight(player) {
    if (player.getRightBound() === this.cols) { return false; }

    const callback = (offsetX, offsetY) => {
      return this.matrix[offsetY][offsetX + 1] === 0;
    };

    return this._canPlayerMove(player, callback);
  }

  canPlayerMoveDown(player) {
    if (player.getBottomBound() === this.rows) { return false; }

    const callback = (offsetX, offsetY) => {
      return (offsetY + 1) < this.rows
        && this.matrix[offsetY + 1][offsetX] === 0;
    }

    return this._canPlayerMove(player, callback);
  }

  playerCollides(player) {
    if (player.piece == null) { return false; }

    const pieceHeight = player.piece.length;
    const pieceWidth = player.piece[0].length;

    for (let y = 0; y < pieceHeight; y++) {
      for (let x = 0; x < pieceWidth; x++) {
        const offsetY = player.position.y + y;
        const offsetX = player.position.x + x;
        if (this.matrix[offsetY][offsetX] > 0) {
          return true;
        }
      }
    }

    return false;
  }

  makePiecesGray(context) {
    context.lineWidth = 0.1;
    context.strokeStyle = piecesColors[0];
    context.fillStyle = '#505050';

    this.matrix.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 0) { return; }

        context.strokeRect(x, y, 1, 1);
        context.fillRect(x, y, 1, 1);
      });
    });
  }

  mergePlayer(player) {
    if (player == null || player.piece == null) { return; }

    player.piece.forEach((row, y) => {
      row.forEach((value, x) => {
        if (value === 0) { return; }

        const offsetY = player.position.y + y;
        const offsetX = player.position.x + x;
        this.matrix[offsetY][offsetX] = value;
      });
    });

    this._emitMatrixHasChangedEvent();
  }

  on(eventName, callback) {
    this.eventsManager.subscribe(eventName, callback);
  }

  reset() {
    this.linesCount = 0;
    this.points = 0;
    this.doublesCount = 0;
    this.triplesCount = 0;
    this.tetrisCount = 0;
    this.matrix.forEach((row) => row.fill(0));

    this._emitMatrixHasChangedEvent();
  }

  update(context) {
    this._sweepLines(this.matrix);
    this._draw(context);
  }

}
