const chai = require('chai');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');
const faker = require('faker');

const { MockBot } = require('./helpers/mockBot');
const voiceChannelManager = require('../commands/voiceChannelManager');
const { CHANNEL_TYPE } = require('../lib/constants');
const { EMOJIS } = require('../commands/voiceChannelManager');

chai.use(sinonChai);
const expect = chai.expect;

const CHANNEL_PREFIX = voiceChannelManager.EMOJIS.CHANNEL_PREFIX;

describe('voiceChannelManager', () => {
  beforeEach(() => {
    sinon.useFakeTimers();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('!vc create', () => {
    it('should create a voice channel', async () => {
      const bot = new MockBot();
      voiceChannelManager.register({ bot });
      const { result, message } = await bot._triggerMessage('!vc create test channel');
      expect(result).to.be.undefined;

      expect(bot.createChannel).to.have.been.called;
      expect(bot.createChannel.firstCall).to.be.calledWith(
        bot._guild.id,
        '⚡ AUTO CHANNELS',
        CHANNEL_TYPE.GROUP,
        sinon.match({ reason: sinon.match.string }),
      );
      expect(bot.createChannel.secondCall).to.be.calledWith(
        bot._guild.id,
        `${CHANNEL_PREFIX} test channel`,
        CHANNEL_TYPE.VOICE,
        sinon.match({ reason: sinon.match.string }),
      );
      expect(bot.addMessageReaction).to.be.calledWith(
        message.channel.id,
        message.id,
        encodeURIComponent(EMOJIS.SUCCESS),
      );
    });

    it('should reject channel names that are too long', async () => {
      let tooLong = '';
      while (tooLong.length < 100) {
        tooLong += faker.lorem.sentences();
      }

      const bot = new MockBot();
      voiceChannelManager.register({ bot });
      const { result } = await bot._triggerMessage(`!vc create ${tooLong}`);
      expect(result).to.be.a.string;
      expect(bot.createChannel).to.not.be.called;
    });
  });

  describe('!vc delete', () => {
    it('should delete a channel that exists', async () => {
      const bot = new MockBot({
        channels: [
          {
            name: `${CHANNEL_PREFIX} AUTO CHANNELS`,
            type: CHANNEL_TYPE.GROUP,
          },
        ],
      });

      const voiceChannel = bot._addChannel({
        name: `${CHANNEL_PREFIX} ${faker.lorem.words(3)}`,
        type: CHANNEL_TYPE.VOICE,
      });
      voiceChannelManager.register({ bot });
      const { result, message } = await bot._triggerMessage(`!vc delete ${voiceChannel.name}`);
      expect(result).to.be.undefined;
      expect(bot.deleteChannel).to.be.calledWith(voiceChannel.id);
      expect(bot.addMessageReaction).to.be.calledWith(
        message.channel.id,
        message.id,
        encodeURIComponent(EMOJIS.SUCCESS),
      );
    });

    it("should return an error if the channel can't be found", async () => {
      const bot = new MockBot();
      voiceChannelManager.register({ bot });
      const { result } = bot._triggerMessage(`!vc delete a channel that does not exist`);
      expect(result).to.be.a.string;
      expect(bot.deleteChannel).not.to.have.been.called;
    });
  });

  describe('!vc delete-all', () => {
    it('should only print a warning', () => {
      const bot = new MockBot();
      voiceChannelManager.register({ bot });
      const { result } = bot._triggerMessage(`!vc delete a channel that does not exist`);
      expect(result).to.be.a.string;
      expect(bot.deleteChannel).not.to.have.been.called;
    });

    it('should delete all the automatic channels with an emoji reaction', async () => {
      const bot = new MockBot({
        channels: [
          { name: EMOJIS.CHANNEL_PREFIX + ' Delete voice', type: CHANNEL_TYPE.VOICE },
          { name: EMOJIS.CHANNEL_PREFIX + ' Delete group', type: CHANNEL_TYPE.GROUP },
          { name: EMOJIS.CHANNEL_PREFIX + ' Delete text', type: CHANNEL_TYPE.TEXT },
          { name: 'Safe voice', type: CHANNEL_TYPE.VOICE },
          { name: 'Safe group', type: CHANNEL_TYPE.GROUP },
          { name: 'Safe text', type: CHANNEL_TYPE.TEXT },
        ],
      });
      voiceChannelManager.register({ bot });
      const reactionCommand = bot._commands['vc']._subcommands[
        'delete-all'
      ]._options.reactionButtons.find((r) => r.emoji === EMOJIS.CONFIRM_DELETE);
      expect(reactionCommand).not.to.be.undefined;

      let message = bot._makeMessage();
      let reactionResult = await reactionCommand.response(message);
      expect(reactionResult).to.be.a.string;
      expect(bot.deleteChannel).to.have.been.calledThrice;
      expect(bot._channels).to.have.length(3);
    });
  });

  describe('cleanup task', () => {
    it('should move channels through their life-cycle', async () => {
      const bot = new MockBot({
        channels: [
          { name: EMOJIS.CHANNEL_PREFIX + ' managed', type: CHANNEL_TYPE.VOICE },
          { name: 'unmanaged', type: CHANNEL_TYPE.VOICE },
        ],
      });
      const channel = bot._channels.find((c) => c.name.startsWith(EMOJIS.CHANNEL_PREFIX));
      const vc = voiceChannelManager.register({ bot });

      await vc.cleanupTask();
      expect(bot.editChannel).to.have.been.calledWith(channel.id, {
        name: EMOJIS.CHANNEL_PREFIX + EMOJIS.CLEANUP + ' managed',
      });

      await vc.cleanupTask();
      expect(bot.deleteChannel).to.have.been.calledWith(channel.id);
      expect(bot._channels).to.have.length(1);
    });
  });
});
