let ftl = require('../lib/ftl');

module.exports.register = ({ bot }) => {
  bot.registerCommand('acceptcoc', (msg) => {
    const adminChannel = process.env.ADMIN_CHANNEL_ID;
    const cocRole = process.env.COC_ROLE_ID;
    const userID = msg.member.id;
    const guildID = msg.channel.guild.id;
    const reason = 'member accepts the Code of Conduct';
    const user = `<@${msg.member.id}>`;

    if (adminChannel) {
      bot.createMessage(adminChannel, { content: ftl('acceptcoc-admin-message', { user }) });
    }
    if (cocRole) {
      bot.addGuildMemberRole(guildID, userID, cocRole, reason);
    }
    bot.createMessage(msg.channel.id, { content: ftl('acceptcoc-member-message') });
  });

  //This fires on the member joining event.
  const cocChannel = process.env.COC_CHANNEL_ID;
  if (cocChannel) {
    bot.on('guildMemberAdd', async (guild, member) => {
      let userName = member.username; // in most places preferr to use nick name however nicks are not available to DMs
      let serverName = guild.name; //guild in this case it the server
      let channel = await bot.getDMChannel(member.id); //Finds the new member's DM Channel
      let channelLink = `<#${cocChannel}>`;

      bot.createMessage(
        channel.id,
        ftl('coc-welcome-prompt', { userName, serverName, channelLink }),
      );
    });
  }
};
