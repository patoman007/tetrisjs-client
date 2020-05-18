const KEYS = {
  name: 'name'
};

class StorageManager {

  constructor() {
    this.storageIsAvailable = window.localStorage != null;
  }

  persistPlayerName(name) {
    if (!this.storageIsAvailable) { return; }

    window.localStorage.setItem(KEYS.name, name);
  }

  gatherPlayerName() {
    return !this.storageIsAvailable
      ? null
      : window.localStorage.getItem(KEYS.name);
  }

}

const storageManager = new StorageManager();

export default storageManager;
