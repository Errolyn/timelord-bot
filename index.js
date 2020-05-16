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
    "createPoll",
    (msg, args) => {

        const emojiSet = args[0];
        let optionSet = [];
        let optionBuilder = [];

        args.shift(); // Removes the first option that determins what emojis to use
        args.push('99'); // Completely arbitrary number chosen to indicate the end of all the options. This is a bad idea and I need to figure out a different way to break up the options later.

        args.forEach( arg => {
            if ((Number(arg)) && (optionBuilder.length > 1) ) {
                optionSet.push(optionBuilder.join(" "), '\n');
                optionBuilder = [];
            }
            optionBuilder.push(arg);
        })
        console.log(optionSet);

        
    },
    {
        description: "Creat a poll",
        fullDescription: "Use this command to create a poll in any channel."
    }
);

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
