import { TETRIS_EVENTS } from '../tetris/Tetris.js';
import * as MESSAGES from '../messages.js';

const EVENTS = [
  TETRIS_EVENTS.player.position,
  TETRIS_EVENTS.player.piece,
  TETRIS_EVENTS.arena.hasChanged,
  TETRIS_EVENTS.score.hasChanged,
  TETRIS_EVENTS.gameOver
];

const TARGETS = [
  'position',
  'piece',
  'arena',
  'score',
  'gameOver'
];

function newPayload(target, value) {
  return {
    type: MESSAGES.state.update,
    message: {
      target,
      value
    }
  };
}

export default class TetrisEventsHandler {

  constructor(tetrisManager) {
    if (EVENTS.length !== TARGETS.length) {
      throw new Error('"Events" and "Targets" do not match.');
    }

    if (tetrisManager == null) {
      throw new Error('"tetrisManager" instance is undefined.');
    }

    this._connection = null;
    this._listening = false;
    this._tetrisManager = tetrisManager;
  }

  _sendMessage(payload) {
    if (this._connection == null) { return; }

    const data = JSON.stringify(payload);
    this._connection.send(data);
  }

  _updatePeerArena(tetris, matrix) {
    tetris.arena.matrix = [...matrix];
    this._updatePeerTetris(tetris);
  }

  _updatePeerGame(tetris) {
    tetris.gameOver = true;
    tetris.update(100);
  }

  _updatePeerPosition(tetris, position) {
    tetris.player.position = { ...position };
    this._updatePeerTetris(tetris);
  }

  _updatePeerPiece(tetris, piece) {
    tetris.player.piece = [...piece];
    this._updatePeerTetris(tetris);
  }

  _updatePeerTetris(tetris) {
    tetris.arena.update(tetris.context);
    tetris.player.update(tetris.context);
  }

  _updatePeerScore(tetris, score) {
    const { numberOfLines, points } = score;
    tetris._updateScore(numberOfLines, points);
  }

  setConnection(connection) {
    this._connection = connection;
  }

  listenToLocalTetrisEvents() {
    if (this._connection == null
        || this._tetrisManager == null
        || this._tetrisManager.localPlayer == null
        || this._listening) {
      return;
    }

    EVENTS.forEach((eventName, index) => {
      this._tetrisManager.localPlayer.tetris.on(eventName, data => {
        const payload = newPayload(TARGETS[index], data);
        this._sendMessage(payload);
      });
    });

    this._listening = true;
  }

  updatePeer(tetris, message) {
    const { target, value } = message;

    switch (target) {
      case TARGETS[0]: return this._updatePeerPosition(tetris, value);
      case TARGETS[1]: return this._updatePeerPiece(tetris, value);
      case TARGETS[2]: return this._updatePeerArena(tetris, value);
      case TARGETS[3]: return this._updatePeerScore(tetris, value);
      case TARGETS[4]: return this._updatePeerGame(tetris);
      default: return null;
    }
  }

}
