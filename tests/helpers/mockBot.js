class MockBot {
  constructor() {
    this.commands = {};
  }

  registerCommand(commandString, callback) {
    this.commands[commandString] = callback;
  }

  triggerCommand(commandString, msg) {
    return this.commands[commandString](msg);
  }
}

module.exports.MockBot = MockBot;
