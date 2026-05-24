module.exports = {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`\n🤖 Connecté en tant que ${client.user.tag}`);
    console.log(`📡 Serveurs : ${client.guilds.cache.size}`);

    // Statut personnalisé du bot
    client.user.setPresence({
      activities: [{ name: '🎮 /help pour m\'utiliser', type: 0 }],
      status: 'online',
    });
  },
};
