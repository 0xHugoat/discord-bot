const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('serverinfo')
    .setDescription('🏠 Affiche les infos du serveur'),

  async execute(interaction) {
    const guild = interaction.guild;
    await guild.members.fetch();

    const bots = guild.members.cache.filter(m => m.user.bot).size;
    const humains = guild.memberCount - bots;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🏠 ${guild.name}`)
      .setThumbnail(guild.iconURL({ dynamic: true, size: 256 }))
      .addFields(
        { name: '🆔 ID', value: guild.id, inline: true },
        { name: '👑 Propriétaire', value: `<@${guild.ownerId}>`, inline: true },
        { name: '📅 Créé le', value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '👥 Membres', value: `${humains} humains + ${bots} bots = **${guild.memberCount}** total`, inline: false },
        { name: '📺 Salons', value: `${guild.channels.cache.size} salons`, inline: true },
        { name: '🎭 Rôles', value: `${guild.roles.cache.size} rôles`, inline: true },
        { name: '😂 Emojis', value: `${guild.emojis.cache.size} emojis`, inline: true },
        { name: '💎 Boosts', value: `${guild.premiumSubscriptionCount} boosts (Niveau ${guild.premiumTier})`, inline: true },
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
