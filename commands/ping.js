const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('🏓 Affiche la latence du bot'),

  async execute(interaction) {
    const sent = await interaction.reply({ content: '🏓 Calcul...', fetchReply: true });
    const latence = sent.createdTimestamp - interaction.createdTimestamp;
    const api = Math.round(interaction.client.ws.ping);

    await interaction.editReply(
      `🏓 **Pong !**\n📡 Latence : **${latence}ms**\n💻 API Discord : **${api}ms**`
    );
  },
};
