let ftl = require('../lib/ftl');

module.exports.register = function (botArguments) {
  const bot = botArguments.bot;
  bot.registerCommand('acceptcoc', (msg) => {
    const adminChannel = process.env.ADMIN_CHANNEL_ID;
    const cocRole = process.env.COC_ROLE_ID;
    const userID = msg.member.id;
    const guildID = msg.channel.guild.id;
    const reason = 'member accepts the Code of Conduct';

    if (adminChannel) {
      bot.createMessage(adminChannel, { content: ftl('accept-coc-admin-message', { userID }) });
    }
    if (cocRole) {
      bot.addGuildMemberRole(guildID, userID, cocRole, reason);
    }
    bot.createMessage(msg.channel.id, { content: ftl('acceptcoc-member-message') });
  });
};
