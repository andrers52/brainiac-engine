/**
 * A fake socket implementation for local communication
 * Simulates socket.io functionality without actual networking
 * @constructor
 */
function FakeSocket() {
  let eventsToFuncs = {};

  /**
   * Registers an event listener for the specified event name
   * @param {string} name - The name of the event to listen for
   * @param {Function} callback - The callback function to execute when the event is emitted
   */
  this.on = function (name, callback) {
    eventsToFuncs[name] = callback;
    // window.addEventListener(name, event => callback(event.detail), false)
  };

  /**
   * Emits an event with the specified name and data
   * @param {string} name - The name of the event to emit
   * @param {*} data - The data to pass to the event listener
   */
  this.emit = function (name, data) {
    // window.dispatchEvent(new CustomEvent(name, {
    //   detail: data, bubbles: true, composed: true
    // }))
    if (eventsToFuncs[name] && typeof eventsToFuncs[name] === "function") {
      eventsToFuncs[name](data);
    }
  };
}

/**
 * Shared FakeSocket instance for local apps where client and server
 * need to communicate through the same socket
 * @type {FakeSocket}
 */
let sharedLocalSocket = null;

/**
 * Gets or creates a shared FakeSocket instance for local app communication
 * @returns {FakeSocket} The shared FakeSocket instance
 */
function getSharedLocalSocket() {
  if (!sharedLocalSocket) {
    sharedLocalSocket = new FakeSocket();
  }
  return sharedLocalSocket;
}

export { getSharedLocalSocket };
