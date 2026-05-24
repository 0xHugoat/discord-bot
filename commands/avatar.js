const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('🖼️ Affiche la photo de profil d\'un membre')
    .addUserOption(opt =>
      opt.setName('membre')
        .setDescription('Le membre (toi par défaut)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('membre') ?? interaction.user;

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`🖼️ Avatar de ${user.tag}`)
      .setImage(user.displayAvatarURL({ dynamic: true, size: 1024 }))
      .addFields(
        { name: '🔗 Lien direct', value: `[Cliquer ici](${user.displayAvatarURL({ dynamic: true, size: 1024 })})` }
      );

    await interaction.reply({ embeds: [embed] });
  },
};
