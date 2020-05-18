import './css/main.css';

import ConnectionManager from './js/connection/ConnectionManager.js';
import TetrisManager, { 
  TETRIS_MANAGER_EVENTS 
} from './js/tetris/TetrisManager.js';

const host = 'ws://tetris-server.herokuapp.com';

const tetrisManager = new TetrisManager();
const connectionManager = new ConnectionManager(tetrisManager);

tetrisManager.on(TETRIS_MANAGER_EVENTS.players.local.start, () => {
  connectionManager.connect(host);
});

tetrisManager.createLocalPlayer();
