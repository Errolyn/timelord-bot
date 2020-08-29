let ftl = require('../lib/ftl');
let { stripContent, getRandomNumber } = require('../lib/utils');

module.exports.register = ({ bot }) => {
  bot.registerCommand('roll', (msg) => {
    try {
      console.log('validate step:');
      let command = validateInputs(stripContent(msg.content)); //Checks all characters are valid outputs command
      console.log(command);
      console.log('diceDetails:');
      let dice = diceDetails(command);
      validateRollparams(dice); // Checks that all mandatory params are present
      console.log(dice);
      console.log('rolling dice:');
      let results = rollDice(dice);
      console.log(results);
      console.log('formatting:');
      return formatResults(dice, results);
    } catch (err) {
      return err.toString();
    }
  });
};

// Handles the logic of the command and returns correct messages to chat.
function formatResults({ add, subtract, amount, sides, modifier }, results) {
  console.log(add, subtract, amount, sides, modifier);
  console.log(
    ftl('roll-output', {
      amount,
      sides,
      modifier: '',
      result: results,
    }),
  );
  if (add) {
    return ftl('roll-output', {
      amount,
      sides,
      modifier: `+ ${modifier}`,
      result: results + modifier,
    });
  } else if (subtract) {
    return ftl('roll-output', {
      amount,
      sides,
      modifier: `- ${modifier}`,
      result: results - modifier,
    });
  } else {
    return ftl('roll-output', {
      amount,
      sides,
      modifier: '',
      result: results,
    });
  }
}

// Generates our dice rolls
function rollDice({ amount, sides, reroll }) {
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
function validateInputs(command) {
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
  return command;
}

// Makes sure we can make a valid roll after command had been parsed.
function validateRollparams({ add, subtract, amount, sides }) {
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

  dice.reroll = command.toLowerCase().includes('r'); //Boolean
  dice.add = diceConfig.includes('+'); //Boolean
  dice.subtract = diceConfig.includes('-'); //Boolean
  dice.amount = Number(amount); //Number
  dice.sides = Number(sides); //Number
  dice.modifier = Number(modifier) ? Number(modifier) : 0; // Sets the value of the modifier to 0 if not provided.
  return dice;
}
