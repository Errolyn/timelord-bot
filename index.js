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
        console.log(rollDecider(stripContent(msg.content)));
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

    const commandCleaned = command.toLowerCase().split(' ').join('').split('r').join(''); // removes spaces and Rs
    
    const pulledApart = commandCleaned.split('d');
    const amount = pulledApart[0];
    let reroll = false;

    if (command.toLowerCase().includes('r')){
        reroll = true;
    }

    
    let sides, modifier;
    if (pulledApart[1].includes('+')){
        [sides, modifier] = pulledApart[1].split('+');
        return rollDice(amount, sides, reroll) + Number(modifier);
    } else if (pulledApart[1].includes('-')) {
        [sides, modifier] = pulledApart[1].split('-');
        return rollDice(amount, sides, reroll) - Number(modifier);
    } else {
        sides = pulledApart[1];
        return rollDice(amount, sides, reroll);
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