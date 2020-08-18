"use strict";

var Eris = require('eris');

let pingCount = 0;
const newsChannel = process.env.NEWS_CHANNEL;

// Heroku requires a port to be bound
require('http').createServer((req, res) => {
    res.end('hello');
  })
    .listen(process.env.PORT || 5050);


const bot = new Eris.CommandClient(process.env.TOKEN, {}, {
    description: "A helpful server bot",
    owner: "Errolyn",
    prefix: "!"
});

bot.on("ready", () => {
    console.log("Ready!");  
});

bot.on("error", err => {
    console.log(err);
});

bot.registerCommand(
    "ping", 
    () => {
        pingCount++
        return "I have been pinged " + pingCount + " times since I last took a nap.";
    },
    {
        description: "Pong!",
        fullDescription: "Used to see if the bot is responding."
    }
);

bot.registerCommand(
    "news", 
    (msg) => {
        const userName = msg.member.nick ? msg.member.nick : msg.author.username;
        const messageChannelName = msg.channel.name;
        const contentForNewsChannel = stripContent(msg.content);

        let attachments = formatAttachments(msg.attachments);
        let content = `${userName} posted in ${messageChannelName}: \n${contentForNewsChannel} \n${attachments}`;

        createMessage(newsChannel, content, attachments);
    }, 
    {
        description: "News feed",
        fullDescription: "Use this command to add content to #news-feed."
    }
);

bot.registerCommand(
    "roll",
    (msg) => {
        try {
            return rollDecider(stripContent(msg.content));
        } catch (err) {
            return err.toString();
        }
    },
    {
        description: "Rolls Dice and outputs value",
        fullDescription: "Use this command with typical dice notation `amount d sides + modifier` add an `r` at the end for rerolling 1s e.g. !roll 2d4 or 5d6+4 or 2d20+2r "
    }
);

bot.connect();

// helper functions

function stripContent(messageContent){
    const stringParts = messageContent.split(' ');
    stringParts.shift();

    const userPost = stringParts.join(' ');
    return(userPost);
};

function createMessage(channel, content){
    bot.createMessage(channel,{ content });
};

function formatAttachments(attachments = []){
    return attachments.map(attachment => attachment.url)
        .join('\n');
};

function rollDecider(command){
    const commandArray = command.toLowerCase().split('');
    const allowableCharacters = ['1','2','3','4','5','6','7','8','9','0','d','r',' ','+','-'];
    const commandCharacters = ['d','r','+','-'];

    commandArray.forEach( character => {
        if ( !allowableCharacters.includes(character) ){
            throw new Error('Please remove invalid characters');
        };
    });

    commandCharacters.forEach( character => {
        let tempIndex = commandArray.indexOf(character);
        if ( tempIndex > 0 ){
            if ( commandArray.indexOf(character, (tempIndex + 1)) > 0 ) {
                throw new Error('You can have one dice, modifier, or operator at a time');
            };
        };
        if ((character === 'r') && (tempIndex != -1) && ((tempIndex + 1) < (commandArray.length))) {
            throw new Error('"r" should only be at the end of your command');
        };
    });

    const commandCleaned = command.toLowerCase().split(' ').join('').split('r').join(''); // removes spaces and Rs 

    const reroll = command.toLowerCase().includes('r');

    let [amount, diceConfig] = commandCleaned.split('d');
    amount = Number(amount);

    if (amount <= 0 || isNaN(amount)) {
        throw new Error('Must roll at least one dice');
    }

    if (amount > 100) {
        throw new Error('You do not need that many dice');
    }

    let sides, modifier;
    if (diceConfig === undefined){
        throw new Error('You must have a dice declared');
    }

    if ((diceConfig.includes('+')) && (diceConfig.includes('-'))){
        throw new Error('You may only have one modifier or operator');
    };

    if (diceConfig.includes('+')){
        [sides, modifier] = diceConfig.split('+');
        sides = Number(sides);
        modifier = Number(modifier);
        if (sides <= 1) {
            throw new Error('Dice must have more than one side');
        }
        return `${amount} d${sides} + ${modifier} were rolled to get ${rollDice(amount, sides, reroll) + Number(modifier)}`;
    } else if (diceConfig.includes('-')) {
        [sides, modifier] = diceConfig.split('-');
        sides = Number(sides);
        modifier = Number(modifier);
        if (sides <= 1) {
            throw new Error('Dice must have more than one side');
        }
        return `${amount} d${sides} - ${modifier} were rolled to get ${rollDice(amount, sides, reroll) - Number(modifier)}`;
    } else {
        sides = diceConfig;
        sides = Number(sides);
        
        if (sides <= 1) {
            throw new Error('Dice must have more than one side');
        }
        return `${amount} d${sides} were rolled to get ${rollDice(amount, sides, reroll)}`;
    }
}

function getRandomNumber(max){
    let randomNumber = Math.floor(Math.random() * max) + 1;
    return randomNumber;
}

function rollDice(amount, sides, reroll){
    let diceTotal = 0;

    for (let roll = 0; roll < amount; roll++){
        let currentRoll;

        do{
            currentRoll = getRandomNumber(sides);
        } 
        while(reroll && currentRoll <= 1);

        diceTotal += currentRoll;
    }
    return diceTotal;
}