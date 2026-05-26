const { Events } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {

    // Commandes slash
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      try {
        await command.execute(interaction);
      } catch (err) {
        console.error(`❌ Erreur commande /${interaction.commandName} :`, err);
        const msg = { content: '❌ Une erreur est survenue.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
      return;
    }

    // Menu déroulant OSINT
    if (interaction.isStringSelectMenu() && interaction.customId === 'osint_select') {
      const lookup = client.commands.get('lookup');
      if (lookup) await lookup.handleSelect(interaction);
      return;
    }

    if (interaction.isStringSelectMenu() && interaction.customId.startsWith('ticket_type_select:')) {
      const tickets = client.commands.get('ticket-panel');
      if (tickets) await tickets.handleSelect(interaction);
      return;
    }

    if (interaction.isButton() && interaction.customId.startsWith('ticket_')) {
      const tickets = client.commands.get('ticket-panel');
      if (tickets) await tickets.handleButton(interaction);
      return;
    }

    // Modal OSINT
    if (interaction.isModalSubmit() && interaction.customId.startsWith('osint_modal_')) {
      const lookup = client.commands.get('lookup');
      if (lookup) await lookup.handleModal(interaction);
      return;
    }
  },
};
