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
        let pollTitle = [];
        let optionSet = [];
        let optionBuilder = [];
        let argCount = 0;

        args.shift(); // Removes the first option that determins what emojis to use
        args.push('99'); // Completely arbitrary number chosen to indicate the end of all the options. This is a bad idea and I need to figure out a different way to break up the options later.

        for (let arg of args){
            argCount++
            if (arg === "Description:" ){
                break;
            }
            pollTitle.push(arg);
        }

        args.splice(0, (argCount)); // Removes the Title

        args.forEach( arg => { // Handles formating the discription
            if ((Number(arg)) && (optionBuilder.length > 1) ) {
                optionSet.push(optionBuilder.join(' '), '\n');
                optionBuilder = [];
            } 
            else if (!(Number(arg))){ // This only adds the text without numbers
                optionBuilder.push(arg);
            };
            
        });

        console.log(optionSet);
        bot.createMessage( msg.channel.id, {

            embed: {
                title: pollTitle.join(' '), // Title of the embed
                description: optionSet.join(' '),
                author: { // Author property
                    name: msg.author.username,
                    icon_url: msg.author.avatarURL
                },
                color: 0x660066, // Color, either in hex (show), or a base-10 integer
                footer: { // Footer text
                    text: "Please report errors to Errolyn"
                }
            }
        })
    },
    {
        description: "Creat a poll",
        fullDescription: "Use this command to create a poll in any channel.\n Example:\n !createPoll Title: What day should we watch a movie? Description: This is a description of the poll. 1 :one: Monday 2 :two: Tuesday"
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
