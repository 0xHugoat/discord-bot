const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('👤 Affiche les infos d\'un membre')
    .addUserOption(opt =>
      opt.setName('membre')
        .setDescription('Le membre à inspecter (toi par défaut)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const membre = interaction.options.getMember('membre') ?? interaction.member;
    const user = membre.user;

    const roles = membre.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .map(r => r.toString())
      .join(', ') || 'Aucun rôle';

    const embed = new EmbedBuilder()
      .setColor(membre.displayHexColor || 0x5865F2)
      .setTitle(`👤 ${user.tag}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: user.id, inline: true },
        { name: '📛 Pseudo serveur', value: membre.displayName, inline: true },
        { name: '🤖 Bot ?', value: user.bot ? 'Oui' : 'Non', inline: true },
        { name: '📅 Compte créé le', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '📅 A rejoint le', value: `<t:${Math.floor(membre.joinedTimestamp / 1000)}:D>`, inline: true },
        { name: `🎭 Rôles (${membre.roles.cache.size - 1})`, value: roles },
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
