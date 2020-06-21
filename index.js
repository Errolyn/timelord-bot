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
        const userName = msg.author.username;
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
            rollDecider(stripContent(msg.content));
        } catch (err) {
            return err
        }
        return rollDecider(stripContent(msg.content));
    },
    {
        description: "Rolls Dice and outputs value",
        fullDescription: "Use this command with typical dice notation `amount d sides + modifier` add an `r` at the end for rerolling 1s e.g. !roll 2d4 or 5d6+4 or 2d20+2r "
    }
)

bot.connect();

// helper functions

function stripContent(messageContent){
    const stringParts = messageContent.split(' ');
    stringParts.shift();

    const userPost = stringParts.join(' ');
    return(userPost);
}

function createMessage(channel, content){
    bot.createMessage(channel,{ content });
}

function formatAttachments(attachments = []){
    return attachments.map(attachment => attachment.url)
        .join('\n');
}

function rollDecider(command){
    const commandArray = command.toLowerCase().split('');
    const allowableCharacters = ['1','2','3','4','5','6','7','8','9','0','d','r',' ','+','-'];
    const commandCharacters = ['d','r','+','-']

    commandCharacters.forEach( character => {
        let tempIndex = commandArray.indexOf(character);
        if ( tempIndex > 0 ){
            if ( commandArray.indexOf(character, (tempIndex + 1)) > 0 ) {
                throw 'You can have one dice, modifier, or operator at a time'
            }
        }
        if ((character === 'r') && (tempIndex != -1) && ((tempIndex + 1) < (commandArray.length))) {
            throw '"r" should only be at the end of your command'
        }
    })

    commandArray.forEach( character => {
        if ( !allowableCharacters.includes(character) ){
            throw 'Please remove invalid characters'
        }
    })

    const commandCleaned = command.toLowerCase().split(' ').join('').split('r').join(''); // removes spaces and Rs 

    let reroll = false;
    if (command.toLowerCase().includes('r')){
        reroll = true;
    }

    const pulledApart = commandCleaned.split('d');
    const amount = pulledApart[0];

    if (Number(amount) <= 0 || isNaN(amount)) {
        throw 'Must roll at least one dice'
    }

    if (amount > 100) {
        throw 'You do not need that many dice'
    }

    let sides, modifier;
    if (pulledApart[1] === undefined){
        throw 'You must have a dice declared';
    }

    if ((pulledApart[1].includes('+')) && (pulledApart[1].includes('-'))){
        throw 'You may only have one modifier or operator';
    };

    if (pulledApart[1].includes('+')){
        [sides, modifier] = pulledApart[1].split('+');
        if (sides <= 1) {
            throw 'Dice must have more than one side';
        }
        return `${amount} d${sides} + ${modifier} were rolled to get ${rollDice(amount, sides, reroll) + Number(modifier)}`;
    } else if (pulledApart[1].includes('-')) {
        [sides, modifier] = pulledApart[1].split('-');
        if (sides <= 1) {
            throw 'Dice must have more than one side';
        }
        return `${amount} d${sides} + ${modifier} were rolled to get ${rollDice(amount, sides, reroll) - Number(modifier)}`;
    } else {
        sides = pulledApart[1];
        
        if (sides <= 1) {
            throw 'Dice must have more than one side';
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
    let roll = 0
    while(roll < amount){
        let currentRoll = getRandomNumber(sides);

        if(reroll){
            while(currentRoll <= 1) {
                currentRoll = getRandomNumber(sides);
            }
        }

        diceTotal += currentRoll;
        roll++;
    }
    return diceTotal;
}