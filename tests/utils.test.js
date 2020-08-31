const expect = require('chai').expect;
const assert = require('assert');
const { getRandomNumber, stripContent, memberName, incomingChannel } = require('../lib/utils');

describe('Utilities', function () {
  describe('#getRandomNumber()', function () {
    it('should return a number', function () {
      let number = getRandomNumber(10);
      expect(number).to.be.a('number');
    });
    it('should be less than max', function () {
      for (let i = 0; i < 100; i++) {
        let number = getRandomNumber(10);
        assert(number <= 10);
      }
    });
    it('should be more than 0', function () {
      for (let i = 0; i < 100; i++) {
        let number = getRandomNumber(1);
        assert(number > 0);
      }
    });
  });
  describe('#stripContent()', function () {
    it('should remove bot trigger', function () {
      const messageContent = '!testing the output is here';
      const output = 'the output is here';
      assert.equal(stripContent(messageContent), output);
    });
  });
  describe('#memberName()', function () {
    it('should return the members username', function () {
      let msg = require('./resources/memberNameUsername.json');
      assert.equal(memberName(msg), 'testUsername');
    });
    it('should return the members nickname', function () {
      let msg = require('./resources/memberNameNickname.json');
      assert.equal(memberName(msg), 'testNickname');
    });
    it('should return the dm username', function () {
      let msg = require('./resources/dmNameUsername.json');
      assert.equal(memberName(msg), 'testUsername');
    });
    it('should return unknown if channel type is not reconized', function () {
      let msg = require('./resources/unknownChannelName.json');
      assert.equal(memberName(msg), 'unknown');
    });
  });
  describe('#incomingChannel()', function () {
    it('should return the channel name where it was pinged', function () {
      let msg = require('./resources/memberNameNickname.json');
      assert.equal(incomingChannel(msg), 'testChannelName');
    });
    it('should return a custom name when pinged from a dm', function () {
      let msg = require('./resources/dmNameUsername.json');
      assert.equal(incomingChannel(msg), 'a DM');
    });
    it('should return unknown if channel type is not reconized', function () {
      let msg = require('./resources/unknownChannelName.json');
      assert.equal(incomingChannel(msg), 'unknown');
    });
  });
});
