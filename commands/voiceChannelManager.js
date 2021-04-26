let ftl = require('../lib/ftl');
let { CHANNEL_TYPE } = require('../lib/constants');

// Cleanup intervals under 5 minutes will not be reliable.
const CLEANUP_INTERVAL_MINUTES = 5;
const EMOJIS = {
  CHANNEL_PREFIX: '⚡',
  SUCCESS: '✅',
  CONFIRM_DELETE: '🔥',
  CANCEL_DELETE: '🙊',
  CLEANUP: '✂',
  FAILED: '⛔',
  WORKING: '⌛',
};

// string length is number of bytes, and many emoji are not one byte. Regex can handle that better.
const oneChar = /^.$/u;
for (const [name, emoji] of Object.entries(EMOJIS)) {
  if (!emoji.match(oneChar)) {
    throw new Error(`Emojis must be just one character, ${name} is too long`);
  }
}

function removeDelineators(input) {
  if (input.includes('->') || input.includes('➡️')) {
    input = input.replace(/->|➡️/g, '');
    return removeDelineators(input);
  }
  return input;
}

class VcCommand {
  static register({ bot }) {
    return new VcCommand({ bot });
  }

  constructor({ bot }) {
    this.bot = bot;
    this.trackedChannels = new Map();

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

    vcCommand.registerSubcommand('rename', (...args) => this.subcommandRename(...args), {
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

    vcCommand.registerSubcommand('debug', (...args) => this.subcommandDebug(...args), {
      guildOnly: true,
      hidden: true,
    });

    setInterval(() => this.cleanupTask(), CLEANUP_INTERVAL_MINUTES * 60 * 1000);
    // Check for channel updates right away, with a short delay to allow the bot to log in.
    setTimeout(() => this.cleanupTask(), 1000);
  }

  async getChannelGroup(guild) {
    const channels = await this.bot.getRESTGuildChannels(guild.id);
    let targetGroup = channels.find((channel) => channel.name.startsWith(EMOJIS.CHANNEL_PREFIX));
    if (!targetGroup) {
      targetGroup = await this.bot.createChannel(
        guild.id,
        `${EMOJIS.CHANNEL_PREFIX} AUTO CHANNELS`,
        CHANNEL_TYPE.GROUP,
        {
          reason: `To hold !vc command channels`,
        },
      );
    }
    return targetGroup;
  }

  async findChannel(guild, needle) {
    needle = needle.toLowerCase();
    const channels = await this.bot.getRESTGuildChannels(guild.id);
    let matches = channels
      .filter((channel) => channel.type === CHANNEL_TYPE.VOICE)
      .filter((channel) => channel.name.startsWith(EMOJIS.CHANNEL_PREFIX))
      .filter((channel) => channel.name.toLowerCase().includes(needle));
    if (matches.length) {
      return matches[0];
    }
    return null;
  }

  async addEmojiReaction(message, emoji) {
    await this.bot.addMessageReaction(message.channel.id, message.id, encodeURIComponent(emoji));
  }

  async subcommandCreate(message, args) {
    const guild = message.channel.guild;
    let channelName = [EMOJIS.CHANNEL_PREFIX, ...args].join(' ');
    if (channelName.length > 100) {
      return ftl('voice-channel-cmd-error-channel-name-too-long');
    }
    channelName = removeDelineators(channelName);

    const parentGroup = await this.getChannelGroup(guild);
    await this.bot.createChannel(guild.id, channelName, CHANNEL_TYPE.VOICE, {
      reason: `Created by ${message.author.username} with !vc create.`,
      parentID: parentGroup.id,
    });
    await this.addEmojiReaction(message, EMOJIS.SUCCESS);
  }

  async subcommandRename(message, args) {
    let vcNames = args
      .join(' ')
      .trim()
      .split(/\s*(?:->|➡️)\s*/); // Looks for instances of -> and ➡️ with any number of space on either side to split on. the '?:' tells split not to capture those Delineators.

    await this.addEmojiReaction(message, EMOJIS.WORKING);

    let channel = await this.findChannel(message.channel.guild, vcNames[0]);

    vcNames[1] = removeDelineators(vcNames[1]);

    if (!channel) {
      await message.removeReactions(message);
      await this.addEmojiReaction(message, EMOJIS.FAILED);
      return ftl('voice-channel-cmd-error-channel-not-found', {
        prefixEmoji: EMOJIS.CHANNEL_PREFIX,
      });
    }
    await channel.edit({ name: `${EMOJIS.CHANNEL_PREFIX} ${vcNames[1]}` });
    await message.removeReactions(message);
    await this.addEmojiReaction(message, EMOJIS.SUCCESS);
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

    if (!channel) {
      return ftl('voice-channel-cmd-error-channel-not-found', {
        prefixEmoji: EMOJIS.CHANNEL_PREFIX,
      });
    }

    // channel is a REST channel, which doesn't have voice data. Upgrade it.
    channel = await this.bot.getChannel(channel.id);
    if (channel.type === CHANNEL_TYPE.VOICE && channel.voiceMembers.size > 0) {
      return ftl('voice-channel-cmd-error-channel-not-empty', { channelName: channel.name });
    }

    await channel.delete(`!vc delete ran by ${message.author.username}`);
    await this.addEmojiReaction(message, EMOJIS.SUCCESS);
  }

  async subcommandDebug(message) {
    let channels = await this.bot.getRESTGuildChannels(message.channel.guild.id);
    let lines = ['Channels:'];
    for (const channel of channels) {
      let parts = [`* ${channel.name}`];

      switch (channel.type) {
        case CHANNEL_TYPE.VOICE:
          parts.push('voice');
          break;
        case CHANNEL_TYPE.GROUP:
          parts.push('group');
          break;
        case CHANNEL_TYPE.TEXT:
          parts.push('text');
          break;
        default:
          parts.push('unknown type');
      }

      if (channel.name.startsWith(EMOJIS.CHANNEL_PREFIX)) {
        parts.push('managed');
      }
      if (channel.name.startsWith(EMOJIS.CHANNEL_PREFIX + EMOJIS.CLEANUP)) {
        parts.push('expiring');
      }
      lines.push(parts.join(' - '));
    }
    let msg = lines.join('\n');
    console.log('!vc debug');
    console.log(msg);
    return msg;
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
      const channels = await this.bot.getRESTGuildChannels(guild.id);
      await Promise.all(
        channels.map(async (channel) => {
          if (
            !channel.name.startsWith(EMOJIS.CHANNEL_PREFIX) ||
            channel.type !== CHANNEL_TYPE.VOICE
          ) {
            return;
          }

          // upgrade REST the channel to non-REST channels to get voice membership data
          channel = await this.bot.getChannel(channel.id);

          if (channel.voiceMembers.size === 0) {
            // Empty channels should proceed through their life-cycle
            if (channel.name.startsWith(EMOJIS.CHANNEL_PREFIX + EMOJIS.CLEANUP)) {
              // Channels already marked for clean up should be deleted
              await channel.delete('Auto channel expired');
            } else {
              // Otherwise mark the channel for cleanup next time
              const newName = channel.name.replace(
                new RegExp(`^${EMOJIS.CHANNEL_PREFIX}`),
                EMOJIS.CHANNEL_PREFIX + EMOJIS.CLEANUP,
              );
              await channel.edit({ name: newName });
            }
          } else {
            // Channel is occupied, make sure it isn't marked for cleanup
            if (channel.name.startsWith(EMOJIS.CHANNEL_PREFIX + EMOJIS.CLEANUP)) {
              const newName = channel.name.replace(EMOJIS.CLEANUP, '');
              await channel.edit({ name: newName });
            }
          }
        }),
      );

      // Finally, if all the remaining auto channels are groups (ie, only the
      // group we made to hold auto channels), delete the group.
      const autoGroupChannels = (await this.bot.getRESTGuildChannels(guild.id)).filter((c) =>
        c.name.startsWith(EMOJIS.CHANNEL_PREFIX),
      );
      if (autoGroupChannels.every((c) => c.type === CHANNEL_TYPE.GROUP)) {
        await Promise.all(autoGroupChannels.map((c) => c.delete('No auto channels remaining')));
      }
    }
  }
}

module.exports = { register: VcCommand.register, EMOJIS, removeDelineators };
