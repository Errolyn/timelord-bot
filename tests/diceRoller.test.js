const expect = require('chai').expect;
const assert = require('assert');
const { rollDice, parseDiceCommand } = require('../commands/diceRoller').forTestsOnly;
const { register } = require('../commands/diceRoller');
const { MockBot } = require('./helpers/mockBot');
const { stripFluentSpecialChars: stripFltSpecialChars } = require('../lib/utils');

describe('diceRoller', function () {
  describe('#rollDice()', function () {
    it('should return a number', function () {
      let results = rollDice({ amount: 1, sides: 4, reroll: true });
      expect(results).to.be.a('number');
    });

    it('should never return a 1 if reroll is true', function () {
      for (let i = 0; i < 100; i++) {
        let results = rollDice({ amount: 1, sides: 4, reroll: true });
        assert(results > 1);
      }
    });

    it('should be able to return a 1 if reroll is false', function () {
      function testResults() {
        for (let i = 0; i < 100; i++) {
          let results = rollDice({ amount: 1, sides: 2, reroll: false });
          if (results === 1) {
            return results;
          }
        }
      }
      assert(testResults() === 1);
    });
  });
  describe('#parseDiceCommand()', function () {
    it('should return an object', function () {
      let dice = parseDiceCommand('1d4');
      expect(dice).to.be.an('object');
    });

    it('should contain correct value types', function () {
      let dice = parseDiceCommand('1d4');
      expect(dice.reroll).to.be.a('boolean');
      expect(dice.add).to.be.a('boolean');
      expect(dice.subtract).to.be.a('boolean');
      expect(dice.amount).to.be.a('number');
      expect(dice.sides).to.be.a('number');
      expect(dice.modifier).to.be.a('number');
    });

    it('should correctly build the dice object of a complex roll', function () {
      expect(parseDiceCommand('3d6+5r')).to.eql({
        reroll: true,
        add: true,
        subtract: false,
        amount: 3,
        sides: 6,
        modifier: 5,
      });
      expect(parseDiceCommand('2d8-2')).to.eql({
        reroll: false,
        add: false,
        subtract: true,
        amount: 2,
        sides: 8,
        modifier: 2,
      });
      expect(parseDiceCommand('2d8r')).to.eql({
        reroll: true,
        add: false,
        subtract: false,
        amount: 2,
        sides: 8,
        modifier: 0,
      });
    });
    it('should not return an invalid dice', function () {
      expect(() => parseDiceCommand('1d4+-5')).to.throw(
        /You may only have one modifier or operator/i,
      );
    });
  });
  describe('#register()', function () {
    const bot = new MockBot();
    register({ bot });
    it('should do something', function () {
      const result = stripFltSpecialChars(bot.triggerCommand('roll', { content: '!roll 1d4+3' }));
      assert(/A d4 \+ 3 was rolled to get [4-7]/.test(result));
    });
  });
});
