import FirebaseManager from './FirebaseManager';

const collectionName = 'leaders';

export default class LeadersBoardManager {

  constructor() {
    this.firebaseManager = new FirebaseManager();
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
  writeGameIntoBoard(gameResult) {
    return this.firebaseManager.firebaseStore
      .collection(collectionName)
      .add(gameResult);
  }

}