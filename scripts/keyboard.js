// --- jQuery style addEventListener (These have been written in game.js ) ---
// $(window).on('keyup', function(event){ Key.onKeyup(event) });
// $(window).on('keydown', function(event){ Key.onKeydown(event) });
// --- DOM style addEventListener (also can work) ---
// false: capture mode
// window.addEventListener('keyup', function(event) { Key.onKeyup(event); }, false);
// window.addEventListener('keydown', function(event) { Key.onKeydown(event); }, false);

let Key = {

  //This array is for multiple keys being pressed simultaneously
  _pressed: {},

  //Keycode list
  A: 65,
  W: 87,
  D: 68,
  S: 83,

  Up: 38, //↑
  Down: 40, //↓
  Left: 37, //←
  Right: 39,  //→

  P: 80,    // pause
  M: 77,  // mute 

  Space: 32,
  Enter: 13,
  
  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },
  
  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },
  
  onKeyup: function(event) {
    delete this._pressed[event.keyCode];
  },

  clear: function() {
    this._pressed = {}; // Clear the pressed keys buffer when turning off the keyboard event listener
  },
};