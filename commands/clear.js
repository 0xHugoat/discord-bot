const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('🗑️ Supprime des messages')
    .addIntegerOption(opt =>
      opt.setName('nombre')
        .setDescription('Nombre de messages à supprimer (1-99)')
        .setMinValue(1)
        .setMaxValue(99)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    const nombre = interaction.options.getInteger('nombre');

    await interaction.channel.bulkDelete(nombre, true);

    const msg = await interaction.reply({
      content: `✅ **${nombre}** message(s) supprimé(s) !`,
      ephemeral: true,
    });
  },
};
