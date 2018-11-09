var Discord = require('discord.io');
var logger = require('winston');
var auth = process.env.TOKEN;
var Database = require('./Database');
const _ = require('underscore');

require('http').createServer((req, res) => {
    res.end('hello');
  })
    .listen(process.env.PORT || 5050);

logger.info("starting load");

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
   token: auth,
   autorun: true
});
bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

//this is all data that should live in DB
var pingCount = 0;
var timeZone = "unknown"; 
var time = "unknown";
// var userObjArray = new Array();


String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

bot.on('disconnect', function(msg, code) {
    if (code === 0) return console.error(msg);
    bot.connect();
});

bot.on('message', function (discordUser, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    var targetChannelIDNews = '512050051820945413'
    var currentUser = findUser(discordUser);
    console.log(currentUser);

    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        var mod = args[1];
        var value = args[2];
       
        args = args.splice(1);
        switch(cmd.toLowerCase()) {
            // !ping
            case 'ping':
                pingCount++
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong! ' + discordUser + ", I have been pinged " + pingCount + " times since I last took a nap."
                });
                break;

            case 'register':
                //add function to create user with timezone information
                if (existingUser(currentUser)){
                    bot.sendMessage({
                       to: channelID,
                       message: "Your user already exists, use !update command to change your information "
                    });
                }
                else if (discordUser){
                    createUser(discordUser, mod, userID);

                    bot.sendMessage({
                        to: channelID,
                        message: "I have registered your user"
                    });
                } else {
                    badCommand(channelID);
                }
                break;

            case 'update':
                badCommand(channelID);
                break;

            case 'time':
                if (mod == 'set'){
                    //add function to save time
                    bot.sendMessage({
                        to: channelID,
                        message: 'I set your next playtime to ' + value
                    }); } 
                else if (mod == 'find'){
                    //add function find correct user's time and display it in the right time zone
                    bot.sendMessage({
                        to: channelID,
                        message: discordUser + " plans to play next at " + "unknown"
                    });
                } else {
                    badCommand(channelID);
                }
                break;

            case 'who':

                if ((mod == "am") && (value)){
                    bot.sendMessage({
                        to: channelID,
                        message: "Your user name is " + discordUser + ". Your timezone is set to " + timeZone + ". You are planning to play next at " + time + "."
                    });
                }
                else if ((mod == "is") && (value)){
                    bot.sendMessage({
                        to: channelID,
                        message: value.capitalize() + " lives in the " + timeZone + " timezone. They will be on next at " + time + "."
                    });
                } else {
                    badCommand(channelID);
                }
                break;

            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: "These are my available commands: \n \n" +
                    "**!ping**\n" +
                    "    *lists number of pings since the bot last failed*\n" +
                    "**!register <timeZone>**\n" +
                    "    *allows your user to use bot*\n" +
                    "**!update**\n" +
                    "    *updates information about your user*\n" +
                    "**!time**\n" + 
                    "    ***set***  <time>\n        *sets your next planed playtime*\n" + 
                    "    ***find***  <userName>\n        *displays user's next planed play time in your timezone*\n" +
                    "**!who**\n" + 
                    "    ***am i***\n        *displays current known information about your user*\n" +
                    "    ***is***  <userName>\n        *displays current known information about a specific user*\n" +
                    "**!news <messageToBeAddedToFeed>** \n" +
                    "    *adds complete message to news feed channel*\n" 
                    
                });
                break;
            case 'news':
                let userMessage = message.substring(1)
                userMessage = userMessage.replace(/news/i, user + " posts:\n"); // TODO: condense this down into one regex match.
                userMessage = userMessage.replace(/<@.*?> | <@.*?>|<@&.*?> | <@&.*?>/g, "");
                bot.sendMessage({
                    to: targetChannelIDNews,
                    message: userMessage
                })
            break;
            // Just add any case commands if you want to..
         }
     }
});

// Proccessing functions

var badCommand = function(channelID){
    bot.sendMessage({
        to: channelID,
        message: "I didn't understand that. Try !help learn about available commands."
    });
};

var existingUser = function(currentUser){
    if (currentUser != undefined){
        return true
    } else {
        return false
    }
};

var createUser = function(userName, timeZone, userID){
    var userInfo = { userID:userID, userName:userName, timeZone:timeZone, nextPlayTime:null, kudos:0 };
    Database.createUser(userInfo);
};

var findUser = function(discordUser){
    console.log(discordUser);
    let foundUser = Database.getUser(discordUser);
    console.log('the found user is: ');
    console.log(foundUser);
   return foundUser;
};

