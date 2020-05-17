import storageManager from '../storageManager';

const HTML_ATTRIBUTES = {
  id: 'id',
  class: 'class',
  for: 'for',
  placeholder: 'placeholder',
  type: 'type'
};

const HTML_ELEMENTS = {
  button: 'button',
  canvas: 'canvas',
  div: 'div',
  input: 'input',
  label: 'label',
  parragraph: 'p',
  section: 'section',
  span: 'span'
};

const CLASS_NAMES = {
  body: 'body',
  buttons: {
    start: 'start-btn'
  },
  container: 'container',
  containers: {
    local: 'local-container',
    remote: 'remote-container',
    restart: 'restart-container'
  },
  controls: 'controls',
  errors: {
    text: 'text-error'
  },
  players: {
    local: 'game',
    remote: 'remote-game'
  },
  remote: {
    player: {
      name: 'remote-player-name'
    }
  },
  screens: {
    start: 'start-screen'
  }
};

const COMPONENTS = {
  controls: 'controlsComponent',
  game: 'gameComponent',
  start: 'startComponent'
};

function createCanvasSection(width, height, scaleX, scaleY) {
  const canvas = document.createElement(HTML_ELEMENTS.canvas);
  const context = canvas.getContext('2d');

  canvas.width = width;
  canvas.height = height;
  context.scale(scaleX, scaleY);

  return canvas;
}

function createContainerElement() {
  const containerElement = document.createElement(HTML_ELEMENTS.div);
  containerElement.classList.add(CLASS_NAMES.container);
  return containerElement;
}

function createRemoteContainerElement() {
  const element = document.createElement(HTML_ELEMENTS.div);
  element.classList.add(CLASS_NAMES.containers.remote);
  return element;
}

function createRemotePlayerContainerElement(clientId) {
  const element = document.createElement(HTML_ELEMENTS.div);

  element.setAttribute(HTML_ATTRIBUTES.id, clientId);
  element.classList.add(CLASS_NAMES.players.remote);

  return element;
}

function createRestartContainer() {
  const element = document.createElement(HTML_ELEMENTS.div);
  element.classList.add(CLASS_NAMES.containers.restart);

  return element;
}

function createRestartButton(callback) {
  const element = document.createElement(HTML_ELEMENTS.button);

  element.classList.add(CLASS_NAMES.buttons.start);
  element.addEventListener('click', () => { callback.call(); });
  element.innerText = 'Jugar de nuevo';

  return element;
}

function getErrorMessageElement() {
  let element = document.querySelector(`.${CLASS_NAMES.errors.text}`);

  if (element == null) {
    element = document.createElement(HTML_ELEMENTS.parragraph);
    element.classList.add(CLASS_NAMES.errors.text);
  }

  element.innerText = 'Por favor, ingrese un nombre válido.';

  return element;
}

function recreateControlsComponent() {
  const container = document.querySelector(`.${CLASS_NAMES.containers.local}`);
  if (container == null) { return; }

  const controlsElement = createControlsComponent();
  container.appendChild(controlsElement);
}

function removeRemotePlayersContainer() {
  const element = getRemoteContainerElement();
  if (element == null) { return; }

  element.parentElement.removeChild(element);
}

export function createLocalCanvasSection() {
  return createCanvasSection(240, 400, 20, 20);
}

export function createLocalContainerElement() {
  const element = document.createElement(HTML_ELEMENTS.div);
  element.classList.add(CLASS_NAMES.containers.local);
  return element;
}

export function createControlsComponent() {
  const section = document.createElement(HTML_ELEMENTS.section);
  const rotateKeysElement = document.createElement(HTML_ELEMENTS.div);
  const container = document.createElement(HTML_ELEMENTS.div);
  const arrowKeysElement = document.createElement(HTML_ELEMENTS.div);
  const spacebarElement = document.createElement(HTML_ELEMENTS.div);

  section.setAttribute(HTML_ATTRIBUTES.id, COMPONENTS.controls);

  rotateKeysElement.innerHTML = '<kbd id="key-q"'
    + 'class="keyboard-button">Q</kbd><kbd id="key-w"'
    + ' class="keyboard-button">W</kbd></div>';

  arrowKeysElement.innerHTML = '<div><div><kbd id="key-left"'
    + ' class="keyboard-button">&#8592;</kbd><kbd id="key-down"'
    + ' class="keyboard-button">&#8595;</kbd><kbd id="key-right"'
    + ' class="keyboard-button">&#8594;</kbd></div>';

  spacebarElement.innerHTML = '<div><kbd id="key-space"'
   + ' class="keyboard-button keyboard-space">Spacebar</kbd></div>';

  container.appendChild(arrowKeysElement);
  container.appendChild(spacebarElement);

  section.classList.add(CLASS_NAMES.controls);
  section.appendChild(rotateKeysElement);
  section.appendChild(container);

  return section;
}

export function createLocalGameComponent(scoreSection, canvasElement) {
  const element = document.createElement(HTML_ELEMENTS.div);

  element.setAttribute(HTML_ATTRIBUTES.id, COMPONENTS.game);
  element.classList.add(CLASS_NAMES.players.local);
  element.appendChild(scoreSection);
  element.appendChild(canvasElement);

  return element;
}

export function createRemotePlayerNameElement(playerName) {
  if (playerName == null) { return; }

  const container = document.createElement(HTML_ELEMENTS.div);
  const parragraph = document.createElement(HTML_ELEMENTS.parragraph);

  container.classList.add(CLASS_NAMES.remote.player.name);
  parragraph.innerText = playerName;

  container.appendChild(parragraph);

  return container;
}

export function createScoreSection() {
  const scoreSection = document.createElement(HTML_ELEMENTS.section);

  scoreSection.classList.add('score');
  scoreSection.innerHTML = '<div><p>Líneas: <span class="numberOfLines">0</span>'
    + '</p></div><div><p>Puntos: <span class="points">0</span></p></div>';

  return scoreSection;
}

export function createStartComponent(startButton) {
  const container = document.createElement(HTML_ELEMENTS.div);
  container.setAttribute(HTML_ATTRIBUTES.id, COMPONENTS.start);
  container.classList.add(CLASS_NAMES.screens.start);

  const input = document.createElement(HTML_ELEMENTS.input);
  input.setAttribute(HTML_ATTRIBUTES.id, 'inputName');
  input.setAttribute(HTML_ATTRIBUTES.type, 'text');
  input.setAttribute(HTML_ATTRIBUTES.placeholder, 'Ingrese su nombre');
  input.value = storageManager.gatherPlayerName() || '';

  const label = document.createElement(HTML_ELEMENTS.label);
  label.setAttribute(HTML_ATTRIBUTES.for, 'inputName');
  label.innerText = 'patoman - TetrisJS';

  container.appendChild(label);
  container.appendChild(input);
  container.appendChild(startButton);

  return container;
}

export function createRemoteCanvasSection() {
  return createCanvasSection(180, 300, 15, 15);
}

export function createRemoteGameElement(clientId, playerName, score, canvas) {
  const container = createRemotePlayerContainerElement(clientId);
  const playerNameElement = createRemotePlayerNameElement(playerName);

  container.appendChild(score);
  container.appendChild(canvas);
  container.appendChild(playerNameElement);

  return container;
}

export function createStartButton() {
  const button = document.createElement(HTML_ELEMENTS.button);

  button.setAttribute(HTML_ATTRIBUTES.id, 'start-btn');
  button.classList.add(CLASS_NAMES.buttons.start);
  button.innerText = 'Empezar';

  return button;
}

export function getBodyElement() {
  return document.querySelector(CLASS_NAMES.body);
}

export function getContainerElement() {
  const element = document.querySelector(`.${CLASS_NAMES.container}`);
  return element || createContainerElement();
}

export function getRemoteContainerElement() {
  const element = document.querySelector(`.${CLASS_NAMES.containers.remote}`);
  return element || createRemoteContainerElement();
}

export function hideElement(element) {
  if (element == null) { return; }

  element.style.display = 'none';
}

export function removeLocalControls() {
  const controlsElement = document.querySelector(`.${CLASS_NAMES.controls}`);
  if (controlsElement == null) { return; }

  controlsElement.parentElement.removeChild(controlsElement);
}

export function removePeersContainer() {
  removeRemotePlayersContainer();
  recreateControlsComponent();
}

export function showElement(element, display = 'inherit') {
  if (element == null) { return; }

  element.style.display = display;
}

export function showPlayerNameError() {
  const startComponent = document.querySelector(`#${COMPONENTS.start}`);
  if (startComponent == null) { return; }

  const errorMessage = getErrorMessageElement();
  const latest = startComponent.children[startComponent.children.length - 1];

  startComponent.insertBefore(errorMessage, latest);
}

export function showRestartButton(callback) {
  const gameComponent = document.querySelector(`#${COMPONENTS.game}`);
  if (gameComponent == null) { return; }

  const container = createRestartContainer();
  const proxyCallback = () => {
    hideElement(container);
    callback();
  };

  const button = createRestartButton(proxyCallback);

  container.appendChild(button);

  gameComponent.appendChild(container);
}
