import * as MESSAGES from '../../../../shared/messages.js';
import TetrisEventsHandler from './TetrisEventsHandler.js';
import storageManager from '../storageManager.js';

export default class ConnectionManager {

  constructor(tetrisManager) {
    if (tetrisManager == null) {
      throw new Error('"TetrisManager" instance is undefined');
    }

    this.connection = null;
    this.peers = new Map();
    this.tetrisManager = tetrisManager;
    this.tetrisEventsHandler = new TetrisEventsHandler(tetrisManager);
  }

  _initSession() {
    const sessionId = window.location.hash.split('#')[1];
    const playerName = storageManager.gatherPlayerName();

    const type = sessionId == null ? MESSAGES.session.create : MESSAGES.client.joined;
    const data = sessionId == null ? { playerName } : { sessionId, playerName };
    const payload = { type, data };

    this._sendMessage(payload);
  }

  _startListeningLocalTetrisEvents(connection) {
    this.tetrisEventsHandler.setConnection(connection);
    this.tetrisEventsHandler.listenToLocalTetrisEvents();
  }

  _onClientJoined(data) {
    if (this.tetrisManager == null) { return; }

    // console.log(`On client joined ${ JSON.stringify(data) }`);

    const { name, id } = data.client;
    const tetris = this.tetrisManager.createRemotePlayer(id, name);
    this.peers.set(id, tetris);
  }

  _onClientLeft(data) {
    if (this.tetrisManager == null) { return; }

    this.tetrisManager.removeRemotePlayer(data.client.id);
    this.peers.delete(data.client.id);

    if (this.peers.size == 0) {
      this.tetrisManager.onPeersAreEmpty();
    }
  }

  _onConnectionOpened() {
    console.log('Connection established');

    this._initSession();
    this._startListeningLocalTetrisEvents(this.connection);
  }

  _onMessageReceived(message) {
    // console.log('onMessageReceived', message);

    const msg = JSON.parse(message);
    switch (msg.type) {
      case MESSAGES.session.created: return this._onSessionCreated(msg.data);
      case MESSAGES.session.info: return this._onSessionInformation(msg.data);
      case MESSAGES.client.joined: return this._onClientJoined(msg.data);
      case MESSAGES.client.left: return this._onClientLeft(msg.data);
      case MESSAGES.state.update: return this._onUpdatePeer(msg);
      default: return null;
    }
  }

  _onSessionCreated(sessionId) {
    window.location.hash = sessionId;
  }

  _onSessionInformation(message) {
    const me = message.peers.you;
    const clients = message.peers.clients.filter((client) => client.id !== me);
    const clientIds = clients.map((client) => client.id);

    // Add player
    clients.forEach((client) => {
      if (this.peers.has(client.id)) { return; }
      this._onClientJoined({ client });
    });

    // Remove player
    [...this.peers.entries()].forEach(([clientId]) => {
      if (clientIds.indexOf(clientId) >= 0) { return; }
      this._onClientLeft({ client: { id: clientId } });
    });
  }

  _onUpdatePeer(message) {
    const tetris = this.peers.get(message.clientId);
    if (tetris == null) { return; }

    this.tetrisEventsHandler.updatePeer(tetris, message.message);
  }

  _sendMessage(payload) {
    if (this.connection == null) { return; }

    const data = JSON.stringify(payload);
    this.connection.send(data);
  }

  connect(address) {
    this.connection = new WebSocket(address);

    this.connection.addEventListener('error', () => { this.connection = null; });
    this.connection.addEventListener('open', () => this._onConnectionOpened());
    this.connection.addEventListener('message', (event) => {
      this._onMessageReceived(event.data);
    });
  }

}
