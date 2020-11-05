const faker = require('faker');
const Snowflake = require('snowflake-util');

const { CHANNEL_TYPE } = require('../../lib/constants');

const snowflake = new Snowflake();

function messageFactory(args) {
  return {
    id: snowflake.generate(),
    author: userFactory(),
    channel: channelFactory(),
    ...args,
  };
}

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
  messageFactory,
  channelFactory,
  userFactory,
};
