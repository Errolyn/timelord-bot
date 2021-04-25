import { TimelordCommand } from '../lib/BotWrapper';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ftl from '../lib/ftl';

const adminChannel = process.env.ADMIN_CHANNEL_ID;
const cocRole = process.env.COC_ROLE_ID;

export const register: TimelordCommand = ({ bot }) => {
  bot.registerCommand('acceptcoc', (msg) => {
    if (!msg.member) {
      console.warn('Message without member passed: ', msg);
      return;
    }

    if (msg.channel.type !== 0 /* text */) {
      return;
    }

    const userID = msg.member.id;
    const guildID = msg.channel.guild.id;
    const reason = 'member accepts the Code of Conduct';
    const user = `<@${msg.member?.id}>`;

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
      const userName = member.username; // in most places preferr to use nick name however nicks are not available to DMs
      const serverName = guild.name; //guild in this case it the server
      const channel = await bot.getDMChannel(member.id); //Finds the new member's DM Channel
      const channelLink = `<#${cocChannel}>`;

      bot.createMessage(
        channel.id,
        ftl('coc-welcome-prompt', { userName, serverName, channelLink }),
      );
    });
  }
};
