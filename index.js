'use strict';

let fetch = require('node-fetch');
let BotWrapper = require('./lib/BotWrapper.js');
let ftl = require('./lib/ftl.js');
let stripContent = require('./lib/utils').stripContent;

let pingCount = 0;

// Heroku requires a port to be bound
require('http')
  .createServer((_, res) => {
    res.end('hello');
  })
  .listen(process.env.PORT || 5050);

const bot = new BotWrapper(
  process.env.TOKEN,
  {},
  {
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
bot.registerCommand('ping', () => {
  pingCount++;
  return ftl('ping-response', { pingCount });
});

require('./commands/codeOfConduct').onJoin({ bot });

bot.registerCommand('news', async (msg) => {
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
});

require('./commands/diceRoller').register({ bot });
require('./commands/codeOfConduct').register({ bot });

bot.connect();
