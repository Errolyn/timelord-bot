/* eslint-disable @typescript-eslint/ban-ts-comment */
'use strict';

import * as http from 'http';
import * as codeOfConduct from './commands/codeOfConduct';
// @ts-ignore
import diceRoller from './commands/diceRoller';
// @ts-ignore
import newsFeed from './commands/newsFeed';
// @ts-ignore
import voiceChannelManager from './commands/voiceChannelManager';
import BotWrapper from './lib/BotWrapper';
// @ts-ignore
import ftl from './lib/ftl';

let pingCount = 0;

// Heroku requires a port to be bound
http
  .createServer((_, res) => {
    res.end('hello');
  })
  .listen(process.env.PORT || 5050);

const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  throw new Error('Configuration error, TOKEN is required.');
}

const bot = new BotWrapper(
  TOKEN,
  {
    restMode: true,
  },
  {
    owner: 'Errolyn',
    prefix: '!',
  },
);

bot.on('ready', () => {
  console.log(`Ready at ${new Date().toLocaleString()}!`);
});

bot.on('error', (err: unknown) => {
  console.log(err);
});

bot.registerCommand('ping', () => {
  pingCount++;
  return ftl('ping-response', { pingCount });
});

newsFeed.register({ bot });
diceRoller.register({ bot });
codeOfConduct.register({ bot });
voiceChannelManager.register({ bot });

bot.connect();
