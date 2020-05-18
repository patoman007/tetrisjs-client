import { TETRIS_EVENTS } from './Tetris.js';
import * as uiUtils from './ui-utils.js';
import storageManager from '../managers/storageManager';

function addClass(element, className) {
  if (element == null) { return; }

  element.classList.add(className);
}

function isInputNameValid(inputName) {
  return inputName.value.length > 0 && inputName.value != '';
}

function removeClass(element, className) {
  if (element == null) { return; }
  element.classList.remove(className);
}

function keyPressed(keyElement, callback) {
  callback.call();
  addClass(keyElement, 'keyboard-button-active');
}

function keyReleased(keyElement) {
  removeClass(keyElement, 'keyboard-button-active');
}

function onStartButtonClicked(tetris, timer, startCallback) {
  const inputName = document.querySelector('#inputName');

  if (inputName == null) { return; }

  if (!isInputNameValid(inputName)) {
    uiUtils.showPlayerNameError();
    return;
  }

  const playerName = inputName.value.toUpperCase();
  storageManager.persistPlayerName(playerName);
  tetris.player.name = playerName;
  
  showGameplay();

  tetris.reset();
  setupTimer(tetris, timer);
  timer.start();

  if (startCallback != null) {
    startCallback.call();
  }
}

function showGameplay() {
  const startScreen = document.querySelector('#startComponent');
  const gameplay = document.querySelector('#gameComponent');
  const restart = document.querySelector('.restart-container');
  const controls = document.querySelector('#controlsComponent');

  uiUtils.hideElement(startScreen);
  uiUtils.showElement(gameplay);
  uiUtils.showElement(controls);
  uiUtils.hideElement(restart);
}

export function setupInputHandler(input, tetris) {
  const keyupEvent = 'keyup';
  const keyQ = document.querySelector('#key-q');
  const keyW = document.querySelector('#key-w');
  const keyLeft = document.querySelector('#key-left');
  const keyDown = document.querySelector('#key-down');
  const keyRight = document.querySelector('#key-right');
  const spacebar = document.querySelector('#key-space');

  input.defineHandler('KeyQ', () => keyPressed(keyQ, () => tetris.rotatePlayer(false)));
  input.defineHandler('KeyQ', () => keyReleased(keyQ), keyupEvent);

  input.defineHandler('KeyW', () => keyPressed(keyW, () => tetris.rotatePlayer()));
  input.defineHandler('KeyW', () => keyReleased(keyW), keyupEvent);

  input.defineHandler('KeyD', () => tetris.toggleDebug());
  input.defineHandler('KeyZ', () => tetris.resetPlayer());

  input.defineHandler('ArrowLeft', () => keyPressed(keyLeft, () => tetris.movePlayerToLeft()));
  input.defineHandler('ArrowLeft', () => keyReleased(keyLeft), keyupEvent);

  input.defineHandler('ArrowDown', () => keyPressed(keyDown, () => tetris.movePlayerDown()));
  input.defineHandler('ArrowDown', () => keyReleased(keyDown), keyupEvent);

  input.defineHandler('ArrowRight', () => keyPressed(keyRight, () => tetris.movePlayerToRight()));
  input.defineHandler('ArrowRight', () => keyReleased(keyRight), keyupEvent);

  input.defineHandler('Space', () => keyPressed(spacebar, () => tetris.movePlayerToResult()));
  input.defineHandler('Space', () => keyReleased(spacebar), keyupEvent);
}

export function setupEvents(tetris, timer) {
  tetris.on(TETRIS_EVENTS.gameOver, () => {
    timer.stop();
    uiUtils.showRestartButton(() => {
      onStartButtonClicked(tetris, timer);
    });
  });
}

export function setupScore(tetris, scoreSection) {
  const numberOfLinesElement = scoreSection.querySelector('.numberOfLines');
  const pointsElement = scoreSection.querySelector('.points');

  tetris.setNumberOfLinesElement(numberOfLinesElement);
  tetris.setPointsElement(pointsElement);
}

export function setupStartButton(startButton, startCallback, tetris, timer) {
  startButton.addEventListener('click', () => {
    onStartButtonClicked(tetris, timer, startCallback);
  });
}

export function setupTimer(tetris, timer) {
  timer.update = (time) => {
    tetris.update(time);
  };
}
