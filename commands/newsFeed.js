let ftl = require('../lib/ftl');
let { stripContent, memberName, incomingChannel } = require('../lib/utils');
let fetch = require('node-fetch');

module.exports.register = (botArguments) => {
  const bot = botArguments.bot;
  bot.registerCommand('news', async (msg) => {
    const newsChannel = process.env.NEWS_CHANNEL;
    const contentForNewsChannel = stripContent(msg.content);
    const userName = memberName(msg);
    const messageChannelName = incomingChannel(msg);

    let content = ftl('news-post-message', {
      userName,
      messageChannelName,
      contentForNewsChannel,
    });

    //TODO: consider adding this to utils
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
};
