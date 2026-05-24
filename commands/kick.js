const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('👢 Expulse un membre du serveur')
    .addUserOption(opt =>
      opt.setName('membre')
        .setDescription('Le membre à expulser')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('raison')
        .setDescription('Raison de l\'expulsion')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const membre = interaction.options.getMember('membre');
    const raison = interaction.options.getString('raison') ?? 'Aucune raison fournie';

    if (!membre.kickable) {
      return interaction.reply({ content: '❌ Je ne peux pas expulser ce membre.', ephemeral: true });
    }

    await membre.kick(raison);

    const embed = new EmbedBuilder()
      .setColor(0xFF6B35)
      .setTitle('👢 Membre expulsé')
      .addFields(
        { name: '👤 Membre', value: `${membre.user.tag}`, inline: true },
        { name: '👮 Modérateur', value: `${interaction.user.tag}`, inline: true },
        { name: '📝 Raison', value: raison },
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
