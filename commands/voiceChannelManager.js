let ftl = require('../lib/ftl');

// Cleanup intervals under 5 minutes will not be reliable.
const CLEANUP_INTERVAL_MINUTES = 5;
const CHANNEL_TYPE = { TEXT: 0, VOICE: 2, GROUP: 4 };
const EMOJIS = {
  CHANNEL_PREFIX: '⚡',
  SUCCESS: '✅',
  CONFIRM_DELETE: '🔥',
  CANCEL_DELETE: '🙊',
  CLEANUP: '✂',
};

// string length is number of bytes, and many emoji are not one byte. Regex can handle that better.
const oneChar = /^.$/u;
for (const [name, emoji] of Object.entries(EMOJIS)) {
  if (!emoji.match(oneChar)) {
    throw new Error(`Emojis must be just one character, ${name} is too long`);
  }
}

module.exports.register = ({ bot }) => {
  new VcCommand({ bot });
};

class VcCommand {
  constructor({ bot }) {
    this.bot = bot;
    this.trackedChannels = new Map();
    this._targetGroup = null;

    const vcCommand = bot.registerCommand('voice-channel', ftl('error-unknown-subcommand'), {
      aliases: ['vc'],
      argsRequired: true,
      guildOnly: true,
      ftlVariables: {
        channelTimeoutMinutes: CLEANUP_INTERVAL_MINUTES * 2,
        channelCleanupEmoji: EMOJIS.CLEANUP,
      },
    });

    vcCommand.registerSubcommand('create', (...args) => this.subcommandCreate(...args), {
      argsRequired: true,
      guildOnly: true,
    });

    vcCommand.registerSubcommand('delete', (...args) => this.subcommandDelete(...args), {
      argsRequired: true,
      guildOnly: true,
    });

    vcCommand.registerSubcommand(
      'delete-all',
      (...args) => this.subcommandDeleteAllWarning(...args),
      {
        guildOnly: true,
        reactionButtons: [
          {
            emoji: EMOJIS.CONFIRM_DELETE,
            type: 'edit',
            response: (...args) => this.reactionCommandDeleteAll(...args),
          },
          {
            emoji: EMOJIS.CANCEL_DELETE,
            type: 'cancel',
            response: ftl('voice-channel-cmd-delete-all-canceled'),
          },
        ],
      },
    );

    setInterval(() => this.cleanupTask(), CLEANUP_INTERVAL_MINUTES * 60 * 1000);
    // Check for channel updates right away, with a short delay to allow the bot to log in.
    setTimeout(() => this.cleanupTask(), 1000);
  }

  async getChannelGroup(guild) {
    if (!this._targetGroup) {
      const channels = await this.bot.getRESTGuildChannels(guild.id);
      let targetGroup = channels.find((channel) => channel.name.startsWith(EMOJIS.CHANNEL_PREFIX));
      if (!targetGroup) {
        targetGroup = await this.bot.createChannel(
          guild.id,
          `${EMOJIS.CHANNEL_PREFIX} AUTO CHANNELS`,
          CHANNEL_TYPE.GROUP,
          {
            reason: `To hold !vc command channesl`,
          },
        );
      }
      this._targetGroup = targetGroup;
    }
    return this._targetGroup;
  }

  async findChannel(guild, needle) {
    needle = needle.toLowerCase();
    const channels = await this.bot.getRESTGuildChannels(guild.id);
    let matches = channels
      .filter((channel) => channel.name.startsWith(EMOJIS.CHANNEL_PREFIX))
      .filter((channel) => channel.name.toLowerCase().includes(needle));
    if (matches.length) {
      return matches[0];
    }
    return null;
  }

  async subcommandCreate(message, args) {
    const guild = message.channel.guild;
    const parentGroup = await this.getChannelGroup(guild);
    const channelName = [EMOJIS.CHANNEL_PREFIX, ...args].join(' ');
    if (channelName.length > 100) {
      return ftl('voice-channel-cmd-error-channel-name-too-long');
    }
    await this.bot.createChannel(guild.id, channelName, CHANNEL_TYPE.VOICE, {
      reason: `Created by ${message.author.username} with !vc create.`,
      parentID: parentGroup.id,
    });
    await this.bot.addMessageReaction(
      message.channel.id,
      message.id,
      encodeURIComponent(EMOJIS.SUCCESS),
    );
  }

  subcommandDeleteAllWarning() {
    return ftl('voice-channel-cmd-delete-all-warning', {
      prefixEmoji: EMOJIS.CHANNEL_PREFIX,
      confirmEmoji: EMOJIS.CONFIRM_DELETE,
      cancelEmoji: EMOJIS.CANCEL_DELETE,
    });
  }

  async reactionCommandDeleteAll(message) {
    const guild = message.channel.guild;
    const channels = await this.bot.getRESTGuildChannels(guild.id);
    const deleteTasks = [];
    const groups = [];

    for (const channel of channels) {
      // do channels later, for less UI flashing
      if (channel.name.startsWith(EMOJIS.CHANNEL_PREFIX)) {
        if (channel.type === CHANNEL_TYPE.GROUP) {
          groups.push(channel);
          continue;
        }
        deleteTasks.push(channel.delete(`!vc delete-all ran by ${message.author.username}`));
      }
    }

    await Promise.all(deleteTasks);
    await Promise.all(
      groups.map((group) => group.delete(`!vc delete-all ran by ${message.author.username}`)),
    );
    return ftl('voice-channel-cmd-delete-all-completed');
  }

  async subcommandDelete(message, args) {
    let channel = await this.findChannel(message.channel.guild, args.join(' '));
    // channel is a REST channel, which doesn't have voice data. Upgrade it.
    channel = await this.bot.getChannel(channel.id);

    if (channel) {
      if (channel.type === CHANNEL_TYPE.VOICE && channel.voiceMembers.size > 0) {
        return ftl('voice-channel-cmd-error-channel-not-empty', { channelName: channel.name });
      }

      await channel.delete(`!vc delete ran by ${message.author.username}`);
      await this.bot.addMessageReaction(
        message.channel.id,
        message.id,
        encodeURIComponent(EMOJIS.SUCCESS),
      );
    } else {
      return ftl('voice-channel-cmd-error-channel-not-found', {
        prefixEmoji: EMOJIS.CHANNEL_PREFIX,
      });
    }
  }

  async getAllGuilds() {
    const limit = 100;
    const page = this.bot.getRESTGuilds(limit);
    if (page.length >= limit) {
      console.warning(
        "Warning, a full page of guilds was returned, this probably means the voice channel manager won't work reliaby anymore",
      );
    }
    return page;
  }

  async cleanupTask() {
    for (const guild of await this.getAllGuilds()) {
      let channels = await Promise.all(
        (await this.bot.getRESTGuildChannels(guild.id))
          // upgrade REST channels to non-Rest channels to get membership
          .map((c) => this.bot.getChannel(c.id)),
      );

      // Channels we manage
      const autoChannels = channels
        .filter((c) => c.name.startsWith(EMOJIS.CHANNEL_PREFIX))
        .filter((c) => c.type === CHANNEL_TYPE.VOICE);

      // Channels that are in the process of expiring
      let expiringChannels = autoChannels.filter((c) => c.name.includes(EMOJIS.CLEANUP));

      // Any occupied channels should stop expiring
      for (const channel of expiringChannels) {
        if (channel.voiceMembers.size > 0) {
          channel.name = channel.name.replace(EMOJIS.CLEANUP, '');
          await channel.editChannel(channel.id, { name: channel.name });
        }
      }
      expiringChannels = expiringChannels.filter((c) => c.name.includes(EMOJIS.CLEANUP));

      // Channels with the cleanup emoji should be deleted
      const expiredChannels = autoChannels.filter((c) =>
        c.name.startsWith(EMOJIS.CHANNEL_PREFIX + EMOJIS.CLEANUP),
      );
      for (const channel of expiredChannels) {
        await channel.delete('Auto channel expired');
      }

      // Check for any channels that need to start expiring
      for (const channel of autoChannels) {
        if (channel.name.includes(EMOJIS.CLEANUP)) {
          // already handling this one
          continue;
        }
        if (channel.voiceMembers.size === 0) {
          const newName = channel.name.replace(
            EMOJIS.CHANNEL_PREFIX,
            EMOJIS.CHANNEL_PREFIX + EMOJIS.CLEANUP,
          );
          await channel.edit({ name: newName });
        }
      }

      // Finally, if there are no more auto-channels, remove the group
      channels = (await this.bot.getRESTGuildChannels(guild.id)).filter((c) =>
        c.name.startsWith(EMOJIS.CHANNEL_PREFIX),
      );
      if (channels.every((c) => c.type === CHANNEL_TYPE.GROUP)) {
        for (const channel of channels) {
          await channel.delete('No auto channels remaining');
        }
      }
    }
  }
}
