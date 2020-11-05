const { expect } = require('chai');
const sinon = require('sinon');
const { guildFactory, channelFactory, messageFactory } = require('./factories');

class MockBot {
  constructor({ channels = [{}] } = {}) {
    this._commands = {};
    this._guild = guildFactory();
    this._auditLog = [];
    this._channels = [];

    for (const channel of channels) {
      this._addChannel(channel);
    }

    let methodsToWrap = [
      'createChannel',
      'registerCommand',
      'getRESTGuilds',
      'getRESTGuildChannels',
      'getChannel',
      'deleteChannel',
      'editChannel',
    ];
    for (const func of methodsToWrap) {
      this[func] = sinon.fake(this[func]);
    }

    let methodsToMock = ['addMessageReaction'];
    for (const func of methodsToMock) {
      this[func] = sinon.mock();
    }
  }

  async _triggerCommand(commandString, msg, args) {
    return await this._commands[commandString].trigger(msg, args);
  }

  _makeMessage(content = 'I like frogs', extras = {}) {
    return messageFactory({
      content,
      guild: this._guild,
      channel: channelFactory({ guild: this._guild }),
      ...extras,
    });
  }

  async _triggerMessage(content, extras) {
    const message = this._makeMessage(content, extras);
    let args;
    let result;
    if (content.startsWith('!')) {
      let [commandString, ...args] = content.split(/\s+/);
      commandString = commandString.slice(1);
      if (this._commands[commandString]) {
        result = await this._commands[commandString].trigger(message, args);
      }
    }

    return { result, message, args };
  }

  _addChannel(channel) {
    if (channel.guild && channel.guild != this._guild) {
      throw new Error("Can't have more than one guild on mockbot");
    }
    const builtChannel = channelFactory({ ...channel, guild: this._guild });
    expect(builtChannel).to.have.property('id');

    builtChannel.delete = () => this.deleteChannel(builtChannel.id);
    builtChannel.edit = (newName) => this.editChannel(builtChannel.id, newName);

    this._channels.push(builtChannel);
    return builtChannel;
  }

  registerCommand(commandString, callback, options = {}) {
    let command = new MockCommand(callback, options);
    this._commands[commandString] = command;
    for (const alias of options.aliases || []) {
      this._commands[alias] = command;
    }
    return command;
  }

  registerCommandAlias(alias, label) {
    this._commands[alias] = this.commands[label];
  }

  createChannel(guildId, name, type, reason) {
    expect(guildId).to.equal(this._guild.id);
    let channel = channelFactory({ name, type, guild: this._guild });
    this._auditLog.push(reason);
    this._addChannel(channel);
    return channel;
  }

  async getRESTGuilds() {
    return [this._guild];
  }

  async getRESTGuildChannels(guildId) {
    expect(guildId).to.equal(this._guild.id);
    return this._channels;
  }

  async getChannel(channelId) {
    return this._channels.find((c) => c.id == channelId);
  }

  async deleteChannel(channelId) {
    this._channels = this._channels.filter((c) => c.id !== channelId);
  }

  async editChannel(channelId, newOpts) {
    let index = this._channels.findIndex((c) => c.id == channelId);
    this._channels[index] = { ...this._channels[index], ...newOpts };
  }
}

class MockCommand {
  constructor(callback, options) {
    this._callback = callback;
    this._options = options;
    this._subcommands = {};

    this.registerSubcommand = sinon.fake(this.registerSubcommand);
  }

  async trigger(msg, args = []) {
    if (this._subcommands && args[0] in this._subcommands) {
      return this._subcommands[args[0]].trigger(msg, args.slice(1));
    } else if (typeof this._callback === 'string') {
      return this._callback;
    }
    return await this._callback(msg, args);
  }

  registerSubcommand(commandString, callback, options) {
    let command = new MockCommand(callback, options);
    this._subcommands[commandString] = command;
    return command;
  }
}

module.exports = {
  MockBot,
  MockCommand,
};
