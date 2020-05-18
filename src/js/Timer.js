export default class Timer {

  constructor(deltaTime = 1 / 36) {
    this.updateProxy = this.createUpdateProxy(deltaTime);
  }

  createUpdateProxy(deltaTime) {
    let accumulatedTime = 0;
    let lastTime = 0;

    return function(time) {
      accumulatedTime += (time - lastTime) / 1000;
      accumulatedTime = accumulatedTime > 1 ? 1 : accumulatedTime;

      while (deltaTime < accumulatedTime ) {
        this.update(time);
        accumulatedTime -= deltaTime;
      }

      lastTime = time;
      this.enqueue();
    };
  }

  update() {
    console.warn('Timer Update function is not defined');
  }

  enqueue() {
    requestAnimationFrame(this.updateProxy.bind(this));
  }

  start() {
    this.enqueue();
  }

  stop() {
    this.update = () => {};
  }
  
}
