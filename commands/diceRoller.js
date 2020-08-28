let ftl = require('../lib/ftl');
let { stripContent, getRandomNumber } = require('../lib/utils');

module.exports.register = (botArguments) => {
  const bot = botArguments.bot;
  bot.registerCommand('roll', (msg) => {
    let command = stripContent(msg.content);
    try {
      return rollDecider(command);
    } catch (err) {
      return err.toString();
    }
  });
};

// Handles the logic of the command and returns correct messages to chat.
function rollDecider(command) {
  validateSubcommands(command); //Checks to make sure all characters are valid
  let dice = diceDetails(command);
  let { reroll, add, subtract, amount, sides, modifier } = dice;
  checkValidroll(amount, add, subtract, sides);

  if (add) {
    return ftl('roll-output', {
      amount,
      sides,
      modifier: `+ ${modifier}`,
      result: rollDice(amount, sides, reroll) + modifier,
    });
  } else if (subtract) {
    return ftl('roll-output', {
      amount,
      sides,
      modifier: `- ${modifier}`,
      result: rollDice(amount, sides, reroll) - modifier,
    });
  } else {
    return ftl('roll-output', {
      amount,
      sides,
      modifier: '',
      result: rollDice(amount, sides, reroll),
    });
  }
}

// Generates our dice rolls
function rollDice(amount, sides, reroll) {
  let diceTotal = 0;

  for (let roll = 0; roll < amount; roll++) {
    let currentRoll;

    do {
      currentRoll = getRandomNumber(sides);
    } while (reroll && currentRoll <= 1);

    diceTotal += currentRoll;
  }
  return diceTotal;
}

// Makes sure all the parts needed to role our dice are present and there are no extranious charactors.
function validateSubcommands(command) {
  const commandArray = command.toLowerCase().split('');
  const allowableCharacters = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    'd',
    'r',
    ' ',
    '+',
    '-',
  ];
  const commandCharacters = ['d', 'r', '+', '-'];

  commandArray.forEach((character) => {
    if (!allowableCharacters.includes(character)) {
      throw new Error(ftl('roll-error-invalid-chars'));
    }
  });

  commandCharacters.forEach((character) => {
    let tempIndex = commandArray.indexOf(character);
    if (tempIndex > 0) {
      if (commandArray.indexOf(character, tempIndex + 1) > 0) {
        throw new Error(ftl('roll-error-multiple-parts'));
      }
    }
    if (character === 'r' && tempIndex != -1 && tempIndex + 1 < commandArray.length) {
      throw new Error(ftl('roll-error-r-not-at-end'));
    }
  });

  if (!commandArray.includes('d')) {
    throw new Error(ftl('roll-error-no-dice-description'));
  }
}

// Makes sure we can make a valid roll after command had been parced.
function checkValidroll(amount, add, subtract, sides) {
  if (amount <= 0) {
    throw new Error(ftl('roll-error-atleast-one-die'));
  }

  if (amount > 100) {
    throw new Error(ftl('roll-error-too-many-dice'));
  }

  if (add && subtract) {
    throw new Error(ftl('roll-error-too-many-operators'));
  }
  if (sides <= 1) {
    throw new Error(ftl('roll-error-too-few-dice-sides'));
  }
}

// Breaks down the command into the needed parts and return an object.
function diceDetails(command) {
  let dice = new Object();
  const commandCleaned = command.toLowerCase().split(' ').join('').split('r').join(''); // removes spaces and Rs

  let [amount, diceConfig] = commandCleaned.split('d');
  let [sides, modifier] = diceConfig.split('+') ? diceConfig.split('+') : diceConfig.split('-');

  dice.reroll = command.toLowerCase().includes('r'); //Truthy
  dice.add = diceConfig.includes('+'); //Truthy
  dice.subtract = diceConfig.includes('-'); //Truthy
  dice.amount = Number(amount); //Number
  dice.sides = Number(sides); //Number
  dice.modifier = Number(modifier) ? Number(modifier) : 0; // Sets the value of the modifier to 0 if not provided.
  return dice;
}
