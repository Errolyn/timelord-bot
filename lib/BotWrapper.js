let eris = require('eris');

let ftl = require('./ftl.js');

module.exports = class BotWrapper extends eris.CommandClient {
  constructor(token, options, commandOptions = {}) {
    if (!commandOptions.description) {
      commandOptions.description = ftl('bot-description');
    }
    super(token, options, commandOptions);
  }

  registerCommand(label, generator, options = {}) {
    if (!options.description) {
      options.description = ftl(`${label}-cmd-description`);
    }
    if (!options.fullDescription) {
      options.fullDescription = ftl(`${label}-cmd-full-description`);
    }
    return super.registerCommand(label, generator, options);
  }
};
