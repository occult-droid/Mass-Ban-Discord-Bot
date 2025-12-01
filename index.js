const { Client, GatewayIntentBits, PermissionFlagsBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const AUTHORIZED_USER_ID = 'Your-Discord-ID';

client.once('ready', async () => {
  console.log(`${client.user.tag} is online`);
});

client.on('messageCreate', async (message) => {
  
  if (message.author.bot || !message.content.startsWith('.')) return;

  const args = message.content.slice(1).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'banall') {
    
    if (message.author.id !== AUTHORIZED_USER_ID) {
      return message.reply({ content: 'You are not authorized to use this command' });
    }


    if (!message.guild.members.me.permissions.has(PermissionFlagsBits.BanMembers)) {
      return message.reply({ content: 'I do not have permission to ban members' });
    }

    try {
      const processingMsg = await message.reply('Starting mass ban...');

      const guild = message.guild;
      const botMember = await guild.members.fetchMe();
      const botHighestRole = botMember.roles.highest;
      const members = await guild.members.fetch();
      
      let banned = 0;
      let failed = 0;

      const banPromises = [];

      for (const [id, member] of members) {
       
        if (member.user.bot || member.id === message.author.id || member.id === client.user.id) continue;

      
        if (member.roles.highest.position < botHighestRole.position) {
          banPromises.push(
            guild.members.ban(id, { reason: `Mass ban by ${message.author.tag}` })
              .then(() => { banned++; })
              .catch(() => { failed++; })
          );
        }
      }

      await Promise.allSettled(banPromises);

      await processingMsg.edit(`Complete. Banned: ${banned} | Failed: ${failed}`);

    } catch (error) {
      console.error('Error during mass ban:', error);
      await message.reply({ content: 'Error occurred during mass ban' });
    }
  }
});


client.login('Bot-Token-Here');
