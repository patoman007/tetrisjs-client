import * as uiUtils from './ui-utils.js';
import * as setups from './setups.js';

import Tetris from './Tetris.js';
import Timer from '../Timer.js';
import InputHandler from '../InputHandler.js';
import EventsManager from '../EventsManager.js';

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
  }

  _emitLocalPlayerHasBennInflated() {
    this.eventsManager.emit(TETRIS_MANAGER_EVENTS.players.local.inflate);
  }

  _emitLocalPlayerHasStarted() {
    this.eventsManager.emit(TETRIS_MANAGER_EVENTS.players.local.start);
  }

  _inflateLocalGameplay(scoreSection, canvasElement, startButton) {
    const body = uiUtils.getBodyElement();
    const containerElement = uiUtils.getContainerElement();
    const localContainerElement = uiUtils.createLocalContainerElement();
    const startScreenElement = uiUtils.createStartComponent(startButton);
    const localGameElement = uiUtils.createLocalGameComponent(scoreSection, canvasElement);
    const controlsElement = uiUtils.createControlsComponent();

    localContainerElement.appendChild(startScreenElement);
    localContainerElement.appendChild(localGameElement);
    localContainerElement.appendChild(controlsElement);

    uiUtils.hideElement(localGameElement);

    containerElement.appendChild(localContainerElement);

    body.appendChild(containerElement);
  }

  _inflateRemoteGameplay(clientId, playerName, score, canvas) {
    const container = uiUtils.getContainerElement();
    const remoteContainer = uiUtils.getRemoteContainerElement();
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

    const input = new InputHandler(document);
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

  removeRemotePlayer(connectionId) {
    const containerElement = document.querySelector(`#${connectionId}`);
    if (containerElement == null) { return; }

    containerElement.parentElement.removeChild(containerElement);
  }

  onPeersAreEmpty() {
    uiUtils.removePeersContainer();

    const { input, tetris } = this.localPlayer;
    if (input == null || tetris == null) { return; }

    setups.setupInputHandler(input, tetris);
  }

}
