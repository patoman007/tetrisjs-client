import { getRandomPiece } from './pieces.js';

import Arena, { ARENA_EVENTS } from './Arena.js';
import Player, { PLAYER_EVENTS } from './Player.js';
import EventsManager from '../managers/EventsManager.js';
import LeadersBoardManager from '../managers/LeadersBoardManager.js';

const LINES_MESSAGES = [null, null, 'DOBLE 🙌', 'TRIPLE ✨', 'TETRIS 🎉'];
const LINES_MESSAGES_DELAY = 750;  // ms
const GAME_OVER_MESSAGE = 'Game Over';

export const TETRIS_EVENTS = {
  arena: {
    hasChanged: 'arena-has-changed-event'
  },
  gameOver: 'game-over-event',
  player: {
    position: 'player-position-has-changed-event',
    piece: 'player-piece-has-changed-event'
  },
  score: {
    hasChanged: 'score-has-changed-event'
  }
};

export default class Tetris {

  constructor(context) {
    this.message = null;
    this.lastTime = 0;
    this.debugMode = false;
    this.gameOver = false;

    this.context = context;
    this.arena = new Arena();
    this.player = new Player();
    this.eventsManager = new EventsManager();
    this.leadersBoardManager = new LeadersBoardManager();

    this._setupArena(this.arena);
    this._setupPlayer(this.player);
    this._resetPlayer(this.player, this.arena);
  }

  _collisionDetected(player, arena) {
    this._mergePlayerIntoArena();
    this._resetPlayer(player, arena);
  }

  _drawPlayerResult(arena, player, context) {
    const aux = this._getPlayerResult(arena, player);
    aux.drawBorder(context);
  }

  _fitPlayerIntoArenaAfterRotation(player, arena) {
    if (player.position.x < 0) {
      player.position.x = 0;
      return;
    }

    const pieceWidth = player.piece[0].length;
    if ((player.position.x + pieceWidth) > arena.cols) {
      player.position.x = arena.cols - pieceWidth;
      return;
    }
  }

  _getPlayerResult(arena, player) {
    const aux = new Player();
    aux.position.x = player.position.x;
    aux.position.y = player.position.y;
    aux.piece = [...player.piece];

    while(arena.canPlayerMoveDown(aux)) {
      aux.position.y += 1;
    }

    return aux;
  }

  _mergePlayerIntoArena() {
    this.arena.mergePlayer(this.player);
  }

  _onGameOver(arena, player, context) {
    arena.makePiecesGray(context);
    player.update(context);

    this._updateMessageLayer(GAME_OVER_MESSAGE, context, arena);
    this._persistGameOnFirebase(arena, player);
    this.eventsManager.emit(TETRIS_EVENTS.gameOver);
  }

  _persistGameOnFirebase(arena, player) {
    const gameResult = {
      playerName: player.name,
      points: arena.points,
      linesCount: arena.linesCount,
      doublesCount: arena.doublesCount,
      triplesCount: arena.triplesCount,
      tetrisCount: arena.tetrisCount,
      timestamp: new Date().toUTCString()
    };

    this.leadersBoardManager.writeGameIntoBoard(gameResult)
      .then(function(docRef) {
        console.log('Document written with ID: ', docRef.id);
      })
      .catch(function(error) {
        console.error('Error adding document: ', error);
      });
  }

  _resetPlayer(player, arena) {
    const piece = getRandomPiece();
    const posX = Math.ceil((arena.cols / 2) - (piece[0].length / 2));

    player.position.x = posX;
    player.position.y = 0;
    player.setPiece(piece);

    this.gameOver = !arena.canPlayerMoveDown(this.player);
  }

  _setupArena(arena) {
    arena.on(ARENA_EVENTS.lines.completed, (linesLength) => {
      this._updateScore(arena.linesCount, arena.points);
      this.message = LINES_MESSAGES[linesLength];
      setTimeout(() => { this.message = null; }, LINES_MESSAGES_DELAY);
    });

    arena.on(ARENA_EVENTS.matrix.hasChanged, (matrix) => {
      this.eventsManager.emit(TETRIS_EVENTS.arena.hasChanged, [...matrix]);
    });
  }

  _setupPlayer(player) {
    player.on(PLAYER_EVENTS.position.hasChanged, (position) => {
      this.eventsManager.emit(TETRIS_EVENTS.player.position, position);
    });

    player.on(PLAYER_EVENTS.piece.hasChanged, (piece) => {
      this.eventsManager.emit(TETRIS_EVENTS.player.piece, piece);
    });
  }

  _updateMessageLayer(message, context, arena) {
    if (message == null) { return; }

    const posX = arena.cols / 2;
    const posY = arena.rows / 2;

    context.fillStyle = '#F5F5F5';
    context.textAlign = 'center';
    context.font = '1px Pixel';
    context.fillText(message, posX, posY);
  }

  _updateScore(numberOfLines, points) {
    if (this.numberOfLinesElement != null) {
      this.numberOfLinesElement.innerText = numberOfLines;
    }

    if (this.pointsElement != null) {
      this.pointsElement.innerText = points;
    }

    const eventData = { numberOfLines, points };
    this.eventsManager.emit(TETRIS_EVENTS.score.hasChanged, eventData);
  }

  movePlayerDown() {
    if (this.arena.canPlayerMoveDown(this.player)) {
      this.player.moveDown();
    } else {
      this._collisionDetected(this.player, this.arena);
    }
  }

  movePlayerToLeft() {
    if (this.player.position.x === 0 && this.player.getLeftBound() > 0) {
      this.player.shrinkPieceToLeft();
      return;
    }

    if (this.arena.canPlayerMoveToLeft(this.player)) {
      this.player.moveToLeft();
    }
  }

  movePlayerToResult() {
    const aux = this._getPlayerResult(this.arena, this.player);
    this.player.position.y = aux.position.y;
  }

  movePlayerToRight() {
    const pieceWidth = this.player.piece[0].length;
    const offsetX = this.player.position.x + pieceWidth;
    const lastColumn = this.arena.cols;
    if (offsetX === lastColumn && this.player.getRightBound() === lastColumn - 1) {
      this.player.shrinkPieceToRight();
      return;
    }

    if (this.arena.canPlayerMoveToRight(this.player)) {
      this.player.moveToRight();
    }
  }

  on(eventName, callback) {
    this.eventsManager.subscribe(eventName, callback);
  }

  reset() {
    this.arena.reset();
    this._updateScore(0, 0);
    this._resetPlayer(this.player, this.arena);
    this.gameOver = false;
  }

  resetPlayer() {
    this._resetPlayer(this.player, this.arena);
  }

  rotatePlayer(clockwise) {
    const playerPiece = [...this.player.piece];

    this.player.rotate(clockwise);

    if (this.arena.playerCollides(this.player)) {
      this.player.piece = [...playerPiece];
      return;
    }

    this._fitPlayerIntoArenaAfterRotation(this.player, this.arena);
  }

  setNumberOfLinesElement(numberOfLinesElement) {
    this.numberOfLinesElement = numberOfLinesElement;
  }

  setPointsElement(pointsElement) {
    this.pointsElement = pointsElement;
  }

  toggleDebug() {
    this.debugMode = !this.debugMode;
  }

  update(time) {
    if (this.gameOver) {
      this._onGameOver(this.arena, this.player, this.context);
      return;
    }

    if (parseInt((time - this.lastTime) / 125) > 1) {
      this.movePlayerDown();
      this.lastTime = time;
    }

    this.arena.update(this.context);
    this.player.update(this.context);
    this._updateMessageLayer(this.message, this.context, this.arena);

    if (this.debugMode) {
      this._drawPlayerResult(this.arena, this.player, this.context);
    }
  }

}
