function FakeSocket() {
  let eventsToFuncs = {};
  // *** RECEIVE (DECLARE) ***
  this.on = function (name, callback) {
    eventsToFuncs[name] = callback;
    // window.addEventListener(name, event => callback(event.detail), false)
  };

  // **** SEND (CALL) ***
  this.emit = function (name, data) {
    // window.dispatchEvent(new CustomEvent(name, {
    //   detail: data, bubbles: true, composed: true
    // }))
    eventsToFuncs[name](data);
  };
}

var fakeSocket = new FakeSocket();

export { fakeSocket };
