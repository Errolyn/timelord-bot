"use strict";

var Eris = require("eris");
var pingCount = 0;

// Heroku requires a port to be bound
require("http")
  .createServer((_, res) => {
    res.end("hello");
  })
  .listen(process.env.PORT || 5050);

const bot = new Eris.CommandClient(
  process.env.TOKEN,
  {},
  {
    description: "A helpful server bot",
    owner: "Errolyn",
    prefix: "!",
  },
);

bot.on("ready", () => {
  console.log("Ready!");
});

bot.on("error", (err) => {
  console.log(err);
});

let cocChannel = process.env.COC_CHANNEL_ID;
if (cocChannel) {
  bot.on("guildMemberAdd", async (guild, member) => {
    let userName = member.username;
    let serverName = guild.name;
    let channel = await bot.getDMChannel(member.id);

    bot.createMessage(
      channel.id,
      `Hi ${userName}, welcome to **${serverName}**! When you have a moment check out our <#${cocChannel}> and once you have accepted it we will give you access to the rest of the server.`,
    );
  });
}

bot.registerCommand(
  "ping",
  () => {
    pingCount++;
    return "I have been pinged " + pingCount + " times since I last took a nap.";
  },
  {
    description: "Pong!",
    fullDescription: "Used to see if the bot is responding.",
  },
);

bot.registerCommand(
  "news",
  (msg) => {
    const newsChannel = process.env.NEWS_CHANNEL;
    const contentForNewsChannel = stripContent(msg.content);

    let userName = "unknown";
    let messageChannelName = "unknown";
    if (msg.channel.type == 0) {
      userName = msg.member.nick ? msg.member.nick : msg.author.username;
      messageChannelName = msg.channel.name;
    } else if (msg.channel.type == 1) {
      userName = msg.author.username;
      messageChannelName = "a DM";
    }

    let attachments = formatAttachments(msg.attachments);
    let content = `${userName} posted in ${messageChannelName}: \n${contentForNewsChannel} \n${attachments}`;

    createMessage(newsChannel, content, attachments);
  },
  {
    description: "News feed",
    fullDescription: "Use this command to add content to #news-feed.",
  },
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
    fullDescription:
      "Use this command with typical dice notation `amount d sides + modifier` add an `r` at the end for rerolling 1s e.g. !roll 2d4 or 5d6+4 or 2d20+2r ",
  },
);

bot.registerCommand(
  "acceptcoc",
  (msg) => {
    const userID = msg.member.id;
    const messageMods = `<@${userID}> has accepted the Code of Conduct.`;
    const messageMember =
      "Thanks for accepting the Code of Conduct, a mod will get you access to the wider server soon!";
    const adminChannel = process.env.ADMIN_CHANNEL_ID;
    const guildID = msg.channel.guild.id;
    const reason = "member accepts the Code of Conduct";
    const cocRole = process.env.COC_ROLE_ID;

    if (adminChannel) {
      createMessage(adminChannel, messageMods);
    }
    if (cocRole) {
      bot.addGuildMemberRole(guildID, userID, cocRole, reason);
    }
    createMessage(msg.channel.id, messageMember);
  },
  {
    description: "Accepts our discords Code of Conduct",
    fullDescription: "Pings mods and applies the COC role if configured.",
  },
);

bot.connect();

// helper functions

function stripContent(messageContent) {
  const stringParts = messageContent.split(" ");
  stringParts.shift();

  const userPost = stringParts.join(" ");
  return userPost;
}

function createMessage(channel, content) {
  bot.createMessage(channel, { content });
}

function formatAttachments(attachments = []) {
  return attachments.map((attachment) => attachment.url).join("\n");
}

function rollDecider(command) {
  const commandArray = command.toLowerCase().split("");
  const allowableCharacters = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "0",
    "d",
    "r",
    " ",
    "+",
    "-",
  ];
  const commandCharacters = ["d", "r", "+", "-"];

  commandArray.forEach((character) => {
    if (!allowableCharacters.includes(character)) {
      throw new Error("Please remove invalid characters");
    }
  });

  commandCharacters.forEach((character) => {
    let tempIndex = commandArray.indexOf(character);
    if (tempIndex > 0) {
      if (commandArray.indexOf(character, tempIndex + 1) > 0) {
        throw new Error("You can have one dice, modifier, or operator at a time");
      }
    }
    if (character === "r" && tempIndex != -1 && tempIndex + 1 < commandArray.length) {
      throw new Error('"r" should only be at the end of your command');
    }
  });

  const commandCleaned = command.toLowerCase().split(" ").join("").split("r").join(""); // removes spaces and Rs

  const reroll = command.toLowerCase().includes("r");

  let [amount, diceConfig] = commandCleaned.split("d");
  amount = Number(amount);

  if (amount <= 0 || isNaN(amount)) {
    throw new Error("Must roll at least one dice");
  }

  if (amount > 100) {
    throw new Error("You do not need that many dice");
  }

  let sides, modifier;
  if (diceConfig === undefined) {
    throw new Error("You must have a dice declared");
  }

  if (diceConfig.includes("+") && diceConfig.includes("-")) {
    throw new Error("You may only have one modifier or operator");
  }

  if (diceConfig.includes("+")) {
    [sides, modifier] = diceConfig.split("+");
    sides = Number(sides);
    modifier = Number(modifier);
    if (sides <= 1) {
      throw new Error("Dice must have more than one side");
    }
    return `${amount} d${sides} + ${modifier} were rolled to get ${
      rollDice(amount, sides, reroll) + Number(modifier)
    }`;
  } else if (diceConfig.includes("-")) {
    [sides, modifier] = diceConfig.split("-");
    sides = Number(sides);
    modifier = Number(modifier);
    if (sides <= 1) {
      throw new Error("Dice must have more than one side");
    }
    return `${amount} d${sides} - ${modifier} were rolled to get ${
      rollDice(amount, sides, reroll) - Number(modifier)
    }`;
  } else {
    sides = diceConfig;
    sides = Number(sides);

    if (sides <= 1) {
      throw new Error("Dice must have more than one side");
    }
    return `${amount} d${sides} were rolled to get ${rollDice(amount, sides, reroll)}`;
  }
}

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
