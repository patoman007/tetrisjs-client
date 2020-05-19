import EventsManager from './EventsManager';

const SDK = {
  core: 'https://www.gstatic.com/firebasejs/7.14.4/firebase-app.js',
  analytics: 'https://www.gstatic.com/firebasejs/7.14.4/firebase-analytics.js',
  store: 'https://www.gstatic.com/firebasejs/7.14.4/firebase-firestore.js'
};

const config = {
  apiKey: 'AIzaSyCXRB5zTya0KF4cmLe1xdSsS-7Jdot2Vr8',
  authDomain: 'tetris-leaders-board.firebaseapp.com',
  databaseURL: 'https://tetris-leaders-board.firebaseio.com',
  projectId: 'tetris-leaders-board',
  storageBucket: 'tetris-leaders-board.appspot.com',
  messagingSenderId: '605801984829',
  appId: '1:605801984829:web:6cc1452c5f6c43b0830b54',
  measurementId: 'G-YM20TTXGL9'
};

export const FIREBASE_EVENTS = {
  load: 'firebase-has-been-loaded-event'
};

export default class FirebaseManager {

  constructor() {
    this.firebase = null;
    this.firebaseStore = null;
    this.events = new EventsManager();

    this._loadSDK();
  }

  _emitFirebaseLoadedEvent() {
    this.events.emit(FIREBASE_EVENTS.load);
  }

  _initFirebase() {
    console.log('Init firebase');
    
    this.firebase = window.firebase;    
    this.firebase.initializeApp(config);
    this.firebase.analytics();
    this.firebaseStore = this.firebase.firestore();

    this._emitFirebaseLoadedEvent();
  }

  _loadSDK() {
    const scriptElement = 'script';
    const body = document.querySelector('body');

    Object.keys(SDK)
      .map((key, index, arr) => {
        const script = document.createElement(scriptElement);
        script.src = SDK[key];

        if (index === (arr.length - 1)) {
          script.addEventListener('load', this._initFirebase.bind(this));
        }

        return script;
      })
      .forEach((scriptElement) => {
        body.appendChild(scriptElement);
      });
  }

  on(eventName, eventHandler) {
    this.events.subscribe(eventName, eventHandler);
  }

}
