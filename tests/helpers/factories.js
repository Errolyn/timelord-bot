const faker = require('faker');
const Snowflake = require('snowflake-util');

const { CHANNEL_TYPE } = require('../../lib/constants');

const snowflake = new Snowflake();

function guildFactory(args) {
  return {
    id: snowflake.generate(),
    ...args,
  };
}

function channelFactory(args) {
  return {
    id: snowflake.generate(),
    name: faker.lorem.slug(),
    type: CHANNEL_TYPE.TEXT,
    guild: guildFactory(),
    voiceMembers: new Map(),
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
  channelFactory,
  userFactory,
};
