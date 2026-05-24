const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'guildMemberAdd',
  async execute(member) {
    // Remplace 'bienvenue' par le nom exact de ton canal
    const canal = member.guild.channels.cache.find(c => c.name === 'bienvenue');
    if (!canal) return;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`👋 Bienvenue sur ${member.guild.name} !`)
      .setDescription(`Salut ${member} ! Tu es le **${member.guild.memberCount}ème** membre.`)
      .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: 'Bonne aventure !' })
      .setTimestamp();

    canal.send({ embeds: [embed] });
  },
};
