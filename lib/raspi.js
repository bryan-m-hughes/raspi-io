/*
Copyright (c) 2014 Bryan Hughes <bryan@theoreticalideations.com>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the 'Software'), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
*/

var Emitter = require('events').EventEmitter;
var Gpio = require('./gpio');
var Board = require('./board');
var async = require('async');

function Raspi(opts) {
  if (!(this instanceof Raspi)) {
    return new Raspi(opts);
  }

  Emitter.call(this);

  // Initialize the board properties
  this.name = 'RaspberryPi-IO';
  this.isReady = false;
  this.pins = [];
  this.analogPins = [];

  // Initialize the GPIO pins
  Board.getBoardPins((function (err, pins) {
    if (err) {
      console.error('Could not initialize board: ' + err);
      return;
    }
    this.pins = pins;

    var pinInstances = this._pinInstances = [];
    function createPinInitializer(pin) {
      return function(next) {
        (pinInstances[pin] = new Gpio(pin)).init(function(err) {
          if (err) {
            next('Could not initialize pin ' + pin + ': ' + err);
          } else {
            next();
          }
        });
      };
    }

    var tasks = [];
    for (var i = 0, len = pins.length; i < len; i++) {
      if (pins[i].supportedModes.length) {
        tasks.push(createPinInitializer(i));
      }
    }
    async.parallel(tasks, (function(err) {
      if (err) {
        console.error('Could not initialize GPIO pins: ' + err);
        return;
      }
      this.isReady = true;
      this.emit('ready');
      this.emit('connect');
    }).bind(this));
  }).bind(this));
}
Raspi.prototype = new Emitter();

Raspi.reset = function() {
  throw 'reset is not yet implemented.';
};

Raspi.prototype = Object.create(Emitter.prototype, {
  constructor: {
    value: Raspi
  },
  MODES: {
    value: Board.modes
  },
  HIGH: {
    value: 1
  },
  LOW: {
    value: 0
  }
});

[
  'pinMode',
  'analogRead',
  'digitalRead',
  'analogWrite',
  'digitalWrite',
  'servoWrite',
  'pulseIn',
  'pulseOut',
  'queryPinState',
  'sendI2CWriteRequest',
  'sendI2CReadRequest',
  'sendI2CConfig',
  '_sendOneWireRequest',
  '_sendOneWireSearch',
  'sendOneWireWriteAndRead',
  'sendOneWireDelay',
  'sendOneWireDelay',
  'sendOneWireReset',
  'sendOneWireRead',
  'sendOneWireSearch',
  'sendOneWireAlarmsSearch',
  'sendOneWireConfig',
  'stepperConfig',
  'stepperStep'
].forEach(function(method) {
  Raspi.prototype[method] = function() {
    throw method + ' is not yet implemented.';
  };
});

module.exports = Raspi;