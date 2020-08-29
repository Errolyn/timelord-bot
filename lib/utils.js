let ftl = require('../lib/ftl');
// General functions that are command agnostic.
module.exports.stripContent = (messageContent) => {
  const stringParts = messageContent.split(' ');
  stringParts.shift();

  const userPost = stringParts.join(' ');
  return userPost;
};

module.exports.memberName = (msg) => {
  if (msg.channel.type === 0) {
    return msg.member.nick || msg.author.username; //Prefers member nickname when available
  } else if (msg.channel.type === 1) {
    return msg.author.username; //Nickname not available from DMs
  }
  return 'unknown';
};

module.exports.incomingChannel = (msg) => {
  if (msg.channel.type === 0) {
    return msg.channel.name;
  } else if (msg.channel.type === 1) {
    return ftl('news-dm-description'); //There is no built in name for the DM channel
  }
  return 'unknown';
};

module.exports.getRandomNumber = (max) => {
  let randomNumber = Math.floor(Math.random() * max) + 1;
  return randomNumber;
};
