const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('📊 Crée un sondage')
    .addStringOption(opt =>
      opt.setName('question')
        .setDescription('La question du sondage')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('choix1')
        .setDescription('Premier choix')
        .setRequired(false)
    )
    .addStringOption(opt =>
      opt.setName('choix2')
        .setDescription('Deuxième choix')
        .setRequired(false)
    ),

  async execute(interaction) {
    const question = interaction.options.getString('question');
    const choix1 = interaction.options.getString('choix1');
    const choix2 = interaction.options.getString('choix2');

    let description = '';
    let reactions = ['👍', '👎'];

    if (choix1 && choix2) {
      description = `**🅰️ ${choix1}** vs **🅱️ ${choix2}**`;
      reactions = ['🅰️', '🅱️'];
    }

    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle(`📊 ${question}`)
      .setDescription(description || 'Vote avec 👍 ou 👎 !')
      .setFooter({ text: `Sondage lancé par ${interaction.user.tag}` })
      .setTimestamp();

    const msg = await interaction.reply({ embeds: [embed], fetchReply: true });

    for (const emoji of reactions) {
      await msg.react(emoji);
    }
  },
};
