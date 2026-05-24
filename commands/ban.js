const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('🔨 Bannit un membre du serveur')
    .addUserOption(opt =>
      opt.setName('membre')
        .setDescription('Le membre à bannir')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('raison')
        .setDescription('Raison du ban')
        .setRequired(false)
    )
    .addIntegerOption(opt =>
      opt.setName('supprimer_messages')
        .setDescription('Supprimer les messages des X derniers jours (0-7)')
        .setMinValue(0)
        .setMaxValue(7)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const membre = interaction.options.getMember('membre');
    const raison = interaction.options.getString('raison') ?? 'Aucune raison fournie';
    const jours = interaction.options.getInteger('supprimer_messages') ?? 0;

    if (!membre.bannable) {
      return interaction.reply({ content: '❌ Je ne peux pas bannir ce membre.', ephemeral: true });
    }

    await membre.ban({ reason: raison, deleteMessageDays: jours });

    const embed = new EmbedBuilder()
      .setColor(0xFF0000)
      .setTitle('🔨 Membre banni')
      .addFields(
        { name: '👤 Membre', value: `${membre.user.tag}`, inline: true },
        { name: '👮 Modérateur', value: `${interaction.user.tag}`, inline: true },
        { name: '📝 Raison', value: raison },
        { name: '🗑️ Messages supprimés', value: `${jours} jour(s)`, inline: true },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
