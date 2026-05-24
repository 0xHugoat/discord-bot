const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const SITES = [
  // Réseaux sociaux
  { name: 'Twitter/X', url: 'https://twitter.com/{}' },
  { name: 'Instagram', url: 'https://instagram.com/{}' },
  { name: 'TikTok', url: 'https://tiktok.com/@{}' },
  { name: 'Snapchat', url: 'https://snapchat.com/add/{}' },
  { name: 'Pinterest', url: 'https://pinterest.com/{}' },
  { name: 'Tumblr', url: 'https://{}.tumblr.com' },
  { name: 'Mastodon', url: 'https://mastodon.social/@{}' },
  { name: 'Threads', url: 'https://threads.net/@{}' },
  { name: 'BeReal', url: 'https://bere.al/{}' },
  { name: 'Facebook', url: 'https://facebook.com/{}' },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/{}' },
  // Streaming & vidéo
  { name: 'YouTube', url: 'https://youtube.com/@{}' },
  { name: 'Twitch', url: 'https://twitch.tv/{}' },
  { name: 'Kick', url: 'https://kick.com/{}' },
  { name: 'Dailymotion', url: 'https://dailymotion.com/{}' },
  { name: 'Vimeo', url: 'https://vimeo.com/{}' },
  { name: 'Rumble', url: 'https://rumble.com/user/{}' },
  // Musique
  { name: 'Spotify', url: 'https://open.spotify.com/user/{}' },
  { name: 'SoundCloud', url: 'https://soundcloud.com/{}' },
  { name: 'Last.fm', url: 'https://last.fm/user/{}' },
  { name: 'Bandcamp', url: 'https://{}.bandcamp.com' },
  { name: 'Audiomack', url: 'https://audiomack.com/{}' },
  // Dev & tech
  { name: 'GitHub', url: 'https://github.com/{}' },
  { name: 'GitLab', url: 'https://gitlab.com/{}' },
  { name: 'Replit', url: 'https://replit.com/@{}' },
  { name: 'Leetcode', url: 'https://leetcode.com/{}' },
  { name: 'HackerNews', url: 'https://news.ycombinator.com/user?id={}' },
  { name: 'Dev.to', url: 'https://dev.to/{}' },
  { name: 'Codepen', url: 'https://codepen.io/{}' },
  { name: 'Stackoverflow', url: 'https://stackoverflow.com/users/{}' },
  { name: 'Npm', url: 'https://npmjs.com/~{}' },
  // Gaming
  { name: 'Steam', url: 'https://steamcommunity.com/id/{}' },
  { name: 'Roblox', url: 'https://www.roblox.com/user.aspx?username={}' },
  { name: 'Chess.com', url: 'https://chess.com/member/{}' },
  { name: 'Lichess', url: 'https://lichess.org/@/{}' },
  { name: 'Minecraft', url: 'https://namemc.com/profile/{}' },
  { name: 'Faceit', url: 'https://faceit.com/en/players/{}' },
  { name: 'Overwolf', url: 'https://profile.overwolf.com/{}' },
  // Créatif & design
  { name: 'Behance', url: 'https://behance.net/{}' },
  { name: 'Dribbble', url: 'https://dribbble.com/{}' },
  { name: 'Deviantart', url: 'https://deviantart.com/{}' },
  { name: 'ArtStation', url: 'https://artstation.com/{}' },
  { name: 'Flickr', url: 'https://flickr.com/people/{}' },
  { name: '500px', url: 'https://500px.com/p/{}' },
  // Forums & communautés
  { name: 'Reddit', url: 'https://reddit.com/user/{}' },
  { name: 'Quora', url: 'https://quora.com/profile/{}' },
  { name: 'Medium', url: 'https://medium.com/@{}' },
  { name: 'Substack', url: 'https://{}.substack.com' },
  { name: 'Patreon', url: 'https://patreon.com/{}' },
  { name: 'Ko-fi', url: 'https://ko-fi.com/{}' },
  // Autres
  { name: 'Linktree', url: 'https://linktr.ee/{}' },
  { name: 'About.me', url: 'https://about.me/{}' },
  { name: 'Gravatar', url: 'https://gravatar.com/{}' },
  { name: 'Trello', url: 'https://trello.com/{}' },
  { name: 'Producthunt', url: 'https://producthunt.com/@{}' },
];

async function checkSite(pseudo, site) {
  const url = site.url.replace('{}', pseudo);
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000),
    });
    return { name: site.name, url, found: res.status === 200 };
  } catch {
    return { name: site.name, url, found: false };
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sherlock')
    .setDescription('🔍 Recherche un pseudo sur les réseaux sociaux (résultat en MP)')
    .addStringOption(opt =>
      opt.setName('pseudo')
        .setDescription('Le pseudo à rechercher')
        .setRequired(true)
    ),

  async execute(interaction) {
    const pseudo = interaction.options.getString('pseudo');

    await interaction.reply({ content: '🔍 Recherche en cours... Tu vas recevoir les résultats en MP !', ephemeral: true });

    const resultats = await Promise.all(SITES.map(site => checkSite(pseudo, site)));

    const trouves = resultats.filter(r => r.found);
    const nonTrouves = resultats.filter(r => !r.found);

    const embedTrouves = new EmbedBuilder()
      .setColor(0x00FF7F)
      .setTitle(`🔍 Sherlock — Résultats pour "${pseudo}"`)
      .setDescription(`**${trouves.length}** compte(s) trouvé(s) sur ${SITES.length} sites`)
      .addFields({
        name: '✅ Trouvé',
        value: trouves.length > 0
          ? trouves.map(r => `[${r.name}](${r.url})`).join('\n')
          : 'Aucun compte trouvé',
      })
      .setTimestamp()
      .setFooter({ text: 'Sherlock — OSINT Bot' });

    if (nonTrouves.length > 0) {
      embedTrouves.addFields({
        name: '❌ Non trouvé',
        value: nonTrouves.map(r => r.name).join(', '),
      });
    }

    try {
      await interaction.user.send({ embeds: [embedTrouves] });
    } catch {
      await interaction.followUp({
        content: '❌ Je ne peux pas t\'envoyer de MP ! Active les MPs dans tes paramètres Discord.',
        ephemeral: true,
      });
    }
  },
};
