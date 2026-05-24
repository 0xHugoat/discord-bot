const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('📋 Affiche toutes les commandes disponibles'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('📖 Aide — Commandes disponibles')
      .setThumbnail(interaction.client.user.displayAvatarURL())
      .addFields(
        {
          name: '📊 Informations',
          value: '`/help` — Cette aide\n`/ping` — Latence du bot\n`/userinfo` — Infos d\'un membre\n`/serverinfo` — Infos du serveur\n`/avatar` — Photo de profil',
        },
        {
          name: '🛠️ Utilitaires',
          value: '`/poll` — Créer un sondage\n`/clear` — Supprimer des messages',
        },
        {
          name: '🔨 Modération',
          value: '`/kick` — Expulser un membre\n`/ban` — Bannir un membre',
        }
      )
      .setFooter({ text: `Demandé par ${interaction.user.tag}` })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
