import * as uiUtils from './ui-utils.js';
import * as setups from './setups.js';

import leadersBoardManager, { 
  LEADERS_BOARD_EVENTS
} from '../managers/leadersBoardManager.js';

import Tetris from './Tetris.js';
import Timer from '../Timer.js';
import InputManager from '../managers/InputManager.js';
import EventsManager from '../managers/EventsManager.js';

export const TETRIS_MANAGER_EVENTS = {
  players: {
    local: {
      inflate: 'localPlayerHasbeenInflated',
      start: 'localPlayerHasStarted'
    }
  }
};

export default class TetrisManager {

  constructor() {
    this.localPlayer = null;
    this.remotePlayers = new Map();
    this.eventsManager = new EventsManager();

    this._initLeadersBoard();
  }

  _emitLocalPlayerHasBennInflated() {
    this.eventsManager.emit(TETRIS_MANAGER_EVENTS.players.local.inflate);
  }

  _emitLocalPlayerHasStarted() {
    this.eventsManager.emit(TETRIS_MANAGER_EVENTS.players.local.start);
  }

  _getLeadersBoardGames() {
    leadersBoardManager.getTopTenGames()
      .then((games) => {
        console.log(games);
        uiUtils.updateGamesBoard(games);
      });
  }

  _initLeadersBoard() {
    leadersBoardManager
      .on(LEADERS_BOARD_EVENTS.load, this._getLeadersBoardGames.bind(this));
  }

  _inflateLeadersBoard(games) {
    const container = uiUtils.getContainer();
    const board = uiUtils.createGamesBoardComponent(games);
    container.appendChild(board);
  }

  _inflateLocalGameplay(scoreSection, canvasElement, startButton) {
    const body = uiUtils.getBodyElement();
    const container = uiUtils.getContainer();
    const localContainer = uiUtils.getLocalContainer();
    const localMainContainer = uiUtils.getLocalMainContainer();

    const startScreenComponent = uiUtils.createStartComponent(startButton);
    const localGameComponent = uiUtils.createLocalGameComponent(scoreSection, canvasElement);
    const controlsComponent = uiUtils.createControlsComponent();
    const gamesBoardComponent = uiUtils.createGamesBoardComponent();

    localMainContainer.appendChild(startScreenComponent);
    localMainContainer.appendChild(localGameComponent);
    localMainContainer.appendChild(controlsComponent);

    uiUtils.hideElement(localGameComponent);

    localContainer.appendChild(localMainContainer);
    localContainer.appendChild(gamesBoardComponent);

    container.appendChild(localContainer);

    body.appendChild(container);
  }

  _inflateRemoteGameplay(clientId, playerName, score, canvas) {
    const container = uiUtils.getContainer();
    const remoteContainer = uiUtils.getRemoteContainer();
    const game = uiUtils.createRemoteGameElement(clientId, playerName, score, canvas);

    remoteContainer.appendChild(game);

    container.appendChild(remoteContainer);
  }

  _setupLocalGame(input, tetris, timer, scoreSection, startButton) {
    setups.setupInputHandler(input, tetris);
    setups.setupTimer(tetris, timer);
    setups.setupScore(tetris, scoreSection);
    setups.setupStartButton(startButton, this._emitLocalPlayerHasStarted.bind(this), tetris, timer);
    setups.setupEvents(tetris, timer, startButton);
  }

  _setupRemoteGame(tetris, scoreSection) {
    setups.setupScore(tetris, scoreSection);
  }

  _updateRemotePlayerName(connectionId, playerName) {
    const container = document.querySelector(`#${connectionId}`);
    if (container == null) { return; }

    const playerNameElement = uiUtils.createRemotePlayerNameElement(playerName);

    container.appendChild(playerNameElement);
  }

  createLocalPlayer() {
    const scoreSection = uiUtils.createScoreSection();
    const canvasSection = uiUtils.createLocalCanvasSection();
    const context = canvasSection.getContext('2d');
    const startButton = uiUtils.createStartButton();

    this._inflateLocalGameplay(scoreSection, canvasSection, startButton);

    const input = new InputManager(document);
    const tetris = new Tetris(context);
    const timer = new Timer();

    this.localPlayer = { input, tetris, timer };

    this._setupLocalGame(input, tetris, timer, scoreSection, startButton);
    this._emitLocalPlayerHasBennInflated();
  }

  createRemotePlayer(clientId, playerName) {
    const score = uiUtils.createScoreSection();
    const canvas = uiUtils.createRemoteCanvasSection();
    const tetris = new Tetris(canvas.getContext('2d'));

    this._inflateRemoteGameplay(clientId, playerName, score, canvas);
    this._setupRemoteGame(tetris, score);

    uiUtils.removeLocalControls();

    return tetris;
  }

  on(eventName, callback) {
    this.eventsManager.subscribe(eventName, callback);
  }

  onPeersAreEmpty() {
    uiUtils.removePeersContainer();

    const { input, tetris } = this.localPlayer;
    if (input == null || tetris == null) { return; }

    setups.setupInputHandler(input, tetris);
  }

  removeRemotePlayer(connectionId) {
    const containerElement = document.querySelector(`#${connectionId}`);
    if (containerElement == null) { return; }

    containerElement.parentElement.removeChild(containerElement);
  }

}
