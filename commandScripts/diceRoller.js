let ftl = require('../lib/ftl');

module.exports.rollDecider = (command) => {
  console.log('diceRoller ran');
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

  const commandCleaned = command.toLowerCase().split(' ').join('').split('r').join(''); // removes spaces and Rs

  const reroll = command.toLowerCase().includes('r');

  let [amount, diceConfig] = commandCleaned.split('d');
  amount = Number(amount);

  if (amount <= 0 || isNaN(amount)) {
    throw new Error(ftl('roll-error-atleast-one-die'));
  }

  if (amount > 100) {
    throw new Error(ftl('roll-error-too-many-dice'));
  }

  let sides, modifier;
  if (diceConfig === undefined) {
    throw new Error(ftl('roll-error-no-dice-description'));
  }

  if (diceConfig.includes('+') && diceConfig.includes('-')) {
    throw new Error(ftl('roll-error-too-many-operators'));
  }

  if (diceConfig.includes('+')) {
    [sides, modifier] = diceConfig.split('+');
    sides = Number(sides);
    modifier = Number(modifier);
    if (sides <= 1) {
      throw new Error(ftl('roll-error-too-few-dice-sides'));
    }
    return ftl('roll-output', {
      amount,
      sides,
      modifier: `+ ${modifier}`,
      result: rollDice(amount, sides, reroll) + Number(modifier),
    });
  } else if (diceConfig.includes('-')) {
    [sides, modifier] = diceConfig.split('-');
    sides = Number(sides);
    modifier = Number(modifier);
    if (sides <= 1) {
      throw new Error(ftl('roll-error-too-few-dice-sides'));
    }
    return ftl('roll-output', {
      amount,
      sides,
      modifier: `- ${modifier}`,
      result: rollDice(amount, sides, reroll) - Number(modifier),
    });
  } else {
    sides = diceConfig;
    sides = Number(sides);

    if (sides <= 1) {
      throw new Error(ftl('roll-error-too-few-dice-sides'));
    }
    return ftl('roll-output', {
      amount,
      sides,
      modifer: '',
      result: rollDice(amount, sides, reroll),
    });
  }
};

function getRandomNumber(max) {
  let randomNumber = Math.floor(Math.random() * max) + 1;
  return randomNumber;
}

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
