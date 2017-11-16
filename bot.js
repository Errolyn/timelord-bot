var Discord = require('discord.io');
var logger = require('winston');
var auth = process.env.TOKEN;
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

var pingCount = 0;
var dict = [];

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`
    if (message.substring(0, 1) == '!') {
        var args = message.substring(1).split(' ');
        var cmd = args[0];
        var mod = args[1];
        var value = args[2];

        var badCommand = function(){
            bot.sendMessage({
                to: channelID,
                message: "I didn't understand that. Try !help learn about available commands."
            });
        };
       
        args = args.splice(1);
        switch(cmd.toLowerCase()) {
            // !ping
            case 'ping':
                pingCount++
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong! ' + user + ", I have been pinged " + pingCount + " times since I last took a nap."
                });
                break;

            case 'register':
                bot.sendMessage({
                    to: channelID,
                    message: 'I am unable to register you right now.'
                });
                // add function to create user with timezone information
                // if (user.present){
                //     bot.sendMessage({
                //        to: channelID,
                //        message: "Your user already exists, use a !update command to change your information "
                //     });
                // }
                // else if (mod == 'user'){
                //     bot.sendMessage({
                //         to: channelID,
                //         message: "I have registered your user"
                //     });
                // } else {
                //     badCommand();
                // }
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
                        message: user + " plans to play next at " + "unknown" 
                    });
                } else {
                    badCommand();
                }
                break;

            case 'who':
                var timezone = "unknown"; //make this a function that gets the user's timezone 
                var time = "unknown"; //make this a function that gets the user's next play time

                if ((mod == "am") && (value)){
                    bot.sendMessage({
                        to: channelID,
                        message: "Your user name is " + user + ". Your timezone is set to " + timezone + ". You are planning to play next at " + time + "."
                    });
                }
                else if ((mod == "is") && (value)){
                    bot.sendMessage({
                        to: channelID,
                        message: value.capitalize() + " lives in the " + timezone + " timezone. They will be on next at " + time + "."
                    });
                } else {
                    badCommand();
                }
                break;

            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: "Valid inputs are as follows: \n \n" +
                    "**!ping**\n *lists number of pings since the bot last failed*\n" +
                    "**!time**\n    ***set***  <time>\n      *sets your next planed playtime*\n" + 
                    "    ***find***  <userName>\n      *displays user's next planed play time in your timezone*\n" +
                    "**!who**\n    ***am i***\n      *displays current known information about your user*\n" +
                    "    ***is***  <userName>\n      *displays current known information about a specific user*\n"
                });
                break;
            // Just add any case commands if you want to..
         }
     }
});