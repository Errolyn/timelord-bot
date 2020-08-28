// General functions that are command agnostic.
module.exports.stripContent = (messageContent) => {
  const stringParts = messageContent.split(' ');
  stringParts.shift();

  const userPost = stringParts.join(' ');
  return userPost;
};
