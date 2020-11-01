let eris = require('eris');

let ftl = require('./ftl.js');

module.exports = class BotWrapper extends eris.CommandClient {
  constructor(token, options, commandOptions = {}) {
    if (!commandOptions.description) {
      commandOptions.description = ftl('bot-description');
    }
    super(token, options, commandOptions);
  }

  registerCommand(label, generator, { ftlVariables, ...options } = {}) {
    if (!options.description) {
      options.description = ftl(`${label}-cmd-description`, ftlVariables);
    }
    if (!options.fullDescription) {
      options.fullDescription = ftl(`${label}-cmd-full-description`, ftlVariables);
    }
    if (!options.errorMessage) {
      options.errorMessage = ftl(`error-unknown`);
    }

    const command = super.registerCommand(label, generator, options);
    return commandWrapper(command);
  }
};

function commandWrapper(command) {
  return new Proxy(command, {
    get(obj, prop) {
      if (prop === 'registerSubcommand') {
        return (label, generator, options = {}) => {
          if (!options.description) {
            options.description = ftl(`${command.label}-${label}-cmd-description`);
          }
          if (!options.fullDescription) {
            options.description = ftl(`${command.label}-${label}-cmd-full-description`);
          }
          if (!options.errorMessage) {
            options.errorMessage = ftl(`error-unknown`);
          }

          return obj[prop](label, generator, options);
        };
      }

      return obj[prop];
    },
  });
}
