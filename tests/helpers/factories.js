const Snowflake = require('snowflake-util');

const snowflake = new Snowflake();

function guildFactory(args) {
  return {
    id: snowflake.generate(),
    ...args,
  };
}

function userFactory(args) {
  return {
    id: snowflake.generate(),
    ...args,
  };
}

module.exports = {
  guildFactory,
  userFactory,
};
