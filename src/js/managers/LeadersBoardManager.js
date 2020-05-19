import FirebaseManager, { FIREBASE_EVENTS } from './FirebaseManager';
import EventsManager from '../managers/EventsManager';

const collectionName = 'leaders';

class LeadersBoardManager {

  constructor() {
    this.isFirebaseLoaded = false;
    this.events = new EventsManager();
    this.firebaseManager = new FirebaseManager();

    this._initFirebase();
  }

  _emitLeadersBoardHasBeenLoadedEvent() {
    this.events.emit(LEADERS_BOARD_EVENTS.load);
  }

  _emptyPromise() {
    return new Promise(() => null);
  }

  _documentsFromQuerySnapshot(querySnapshot) {
    // qds = QueryDocumentSnapshot
    return querySnapshot.docs
      .filter((qds) => qds.exists)
      .map((qds) => qds.data());
  }

  _initFirebase() {
    this.firebaseManager.on(FIREBASE_EVENTS.load, () => {
      this.isFirebaseLoaded = true;
      this._emitLeadersBoardHasBeenLoadedEvent();
    });
  }

  _retrieveGamesOrderedByPoints(limit = 1000) {
    return this.firebaseManager.firebaseStore
      .collection(collectionName)
      .orderBy(gameResultModel.points, 'desc')
      .limit(limit)
      .get();
  }

  getTopTenGames() {
    if (!this.isFirebaseLoaded) { return this._emptyPromise(); }

    return new Promise((resolve, reject) => {
      this._retrieveGamesOrderedByPoints(10)
        .then((querySnapshot) => {
          resolve(this._documentsFromQuerySnapshot(querySnapshot));
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  on(eventName, eventHandler) {
    this.events.subscribe(eventName, eventHandler);
  }

  /**
   * params: gameResult Object 
   * {
   *   playerName: string,
   *   points: number,
   *   linesCount: number,
   *   doublesCount: number,
   *   triplesCount: number,
   *   tetrisCount: number
   * }
   * 
   * return: promise
   */
  saveGame(gameResult) {
    if (!this.isFirebaseLoaded) { return this._emptyPromise(); }

    return this.firebaseManager.firebaseStore
      .collection(collectionName)
      .add(gameResult);
  }

}

const leadersBoardManager = new LeadersBoardManager();

export const LEADERS_BOARD_EVENTS = {
  load: 'leaders-board-has-been-loaded-event'
};

export const gameResultModel = {
  playerName: 'playerName',
  points: 'points',
  linesCount: 'linesCount',
  doublesCount: 'doublesCount',
  triplesCount: 'triplesCount',
  tetrisCount: 'tetrisCount'
};

export default leadersBoardManager;
