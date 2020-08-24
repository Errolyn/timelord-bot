'use strict';

let Eris = require('eris');
let fetch = require('node-fetch');
let ftl = require('./lib/ftl.js');
let diceRoller = require('./commandScripts/diceRoller.js');
let pingCount = 0;

// Heroku requires a port to be bound
require('http')
  .createServer((_, res) => {
    res.end('hello');
  })
  .listen(process.env.PORT || 5050);

const bot = new Eris.CommandClient(
  process.env.TOKEN,
  {},
  {
    description: 'A helpful server bot',
    owner: 'Errolyn',
    prefix: '!',
  },
);

bot.on('ready', () => {
  console.log('Ready!');
});

bot.on('error', (err) => {
  console.log(err);
});

let cocChannel = process.env.COC_CHANNEL_ID;
if (cocChannel) {
  bot.on('guildMemberAdd', async (guild, member) => {
    let userName = member.username;
    let serverName = guild.name;
    let channel = await bot.getDMChannel(member.id);

    bot.createMessage(channel.id, ftl('coc-welcome-prompt', { userName, serverName, cocChannel }));
  });
}

bot.registerCommand(
  'ping',
  () => {
    pingCount++;
    return ftl('ping-response', { pingCount });
  },
  {
    description: ftl('ping-cmd-description'),
    fullDescription: ftl('ping-cmd-long-description'),
  },
);

bot.registerCommand(
  'news',
  async (msg) => {
    const newsChannel = process.env.NEWS_CHANNEL;
    const contentForNewsChannel = stripContent(msg.content);

    let userName = 'unknown';
    let messageChannelName = 'unknown';
    if (msg.channel.type == 0) {
      userName = msg.member.nick ? msg.member.nick : msg.author.username;
      messageChannelName = msg.channel.name;
    } else if (msg.channel.type == 1) {
      userName = msg.author.username;
      messageChannelName = ftl('news-dm-description');
    }

    let content = ftl('news-post-message', {
      userName,
      messageChannelName,
      contentForNewsChannel,
    });

    let files = await Promise.all(
      msg.attachments.map(async (attachment) => {
        try {
          let res = await fetch(attachment.url);
          let buffer = await res.buffer();
          return { file: buffer, name: attachment.filename };
        } catch (err) {
          console.warning(`Couldn't fetch attachment from message ${msg.id}: ${attachment.url}`);
          return null;
        }
      }),
    );
    files = files.filter((a) => a !== null);

    bot.createMessage(newsChannel, content, files);
  },
  {
    description: ftl('news-cmd-description'),
    fullDescription: ftl('news-cmd-long-description'),
  },
);

bot.registerCommand(
  'roll',
  (msg) => {
    let dice = stripContent(msg.content);
    console.log('dice');
    try {
      console.log(diceRoller.rollDecider(dice));
      diceRoller.rollDecider(dice);
    } catch (err) {
      return err.toString();
    }
  },
  {
    description: ftl('roll-cmd-description'),
    fullDescription: ftl('roll-cmd-long-description'),
  },
);

bot.registerCommand(
  'acceptcoc',
  (msg) => {
    const adminChannel = process.env.ADMIN_CHANNEL_ID;
    const cocRole = process.env.COC_ROLE_ID;
    const userID = msg.member.id;
    const guildID = msg.channel.guild.id;
    const reason = 'member accepts the Code of Conduct';

    if (adminChannel) {
      bot.createMessage(adminChannel, { content: ftl('accept-coc-admin-message', { userID }) });
    }
    if (cocRole) {
      bot.addGuildMemberRole(guildID, userID, cocRole, reason);
    }
    bot.createMessage(msg.channel.id, { content: ftl('accept-coc-message-member') });
  },
  {
    description: ftl('acceptcoc-cmd-description'),
    fullDescription: ftl('acceptcoc-cmd-long-description'),
  },
);

bot.connect();

// helper functions

function stripContent(messageContent) {
  const stringParts = messageContent.split(' ');
  stringParts.shift();

  const userPost = stringParts.join(' ');
  return userPost;
}
