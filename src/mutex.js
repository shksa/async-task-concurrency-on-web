const locked = 1;
const unlocked = 0;
// https://blogtitle.github.io/using-javascript-sharedarraybuffers-and-atomics/
export class Mutex {
  /**
   * Instantiate Mutex.
   * If opt_sab is provided, the mutex will use it as a backing array.
   * @param {SharedArrayBuffer} opt_sab Optional SharedArrayBuffer.
   */
  constructor(opt_sab) {
    this._sab = opt_sab || new SharedArrayBuffer(4);
    this._mu = new Int32Array(this._sab);
  }

  /**
   * Instantiate a Mutex connected to the given one.
   * @param {Mutex} mu the other Mutex.
   */
  static connect(mu) {
    return new Mutex(mu._sab);
  }

  lock() {
    for(;;) {
      if (Atomics.compareExchange(this._mu, 0, unlocked, locked) == unlocked) {
        return;
      }
      Atomics.wait(this._mu, 0, locked);
    }
  }

  unlock() {
    if (Atomics.compareExchange(this._mu, 0, locked, unlocked) != locked) {
      throw new Error("Mutex is in inconsistent state: unlock on unlocked Mutex.");
    }
    Atomics.notify(this._mu, 0, 1);
  }
}