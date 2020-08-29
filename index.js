'use strict';

let BotWrapper = require('./lib/BotWrapper.js');
let ftl = require('./lib/ftl.js');

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

require('./commands/newsFeed').register({ bot });
require('./commands/diceRoller').register({ bot });
require('./commands/codeOfConduct').register({ bot });

bot.connect();
