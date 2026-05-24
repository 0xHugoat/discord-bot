const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

const SITES = [
  { name: 'Twitter/X', url: 'https://twitter.com/{}' },
  { name: 'Instagram', url: 'https://instagram.com/{}' },
  { name: 'GitHub', url: 'https://github.com/{}' },
  { name: 'TikTok', url: 'https://tiktok.com/@{}' },
  { name: 'Reddit', url: 'https://reddit.com/user/{}' },
  { name: 'YouTube', url: 'https://youtube.com/@{}' },
  { name: 'Twitch', url: 'https://twitch.tv/{}' },
  { name: 'Pinterest', url: 'https://pinterest.com/{}' },
  { name: 'Snapchat', url: 'https://snapchat.com/add/{}' },
  { name: 'Steam', url: 'https://steamcommunity.com/id/{}' },
  { name: 'Spotify', url: 'https://open.spotify.com/user/{}' },
  { name: 'SoundCloud', url: 'https://soundcloud.com/{}' },
  { name: 'Roblox', url: 'https://www.roblox.com/user.aspx?username={}' },
  { name: 'Chess.com', url: 'https://chess.com/member/{}' },
  { name: 'Kick', url: 'https://kick.com/{}' },
  { name: 'LinkedIn', url: 'https://linkedin.com/in/{}' },
  { name: 'Tumblr', url: 'https://{}.tumblr.com' },
  { name: 'Mastodon', url: 'https://mastodon.social/@{}' },
  { name: 'Threads', url: 'https://threads.net/@{}' },
  { name: 'BeReal', url: 'https://bere.al/{}' },
  { name: 'Facebook', url: 'https://facebook.com/{}' },
  { name: 'Dailymotion', url: 'https://dailymotion.com/{}' },
  { name: 'Vimeo', url: 'https://vimeo.com/{}' },
  { name: 'Last.fm', url: 'https://last.fm/user/{}' },
  { name: 'Bandcamp', url: 'https://{}.bandcamp.com' },
  { name: 'GitLab', url: 'https://gitlab.com/{}' },
  { name: 'Replit', url: 'https://replit.com/@{}' },
  { name: 'Leetcode', url: 'https://leetcode.com/{}' },
  { name: 'Dev.to', url: 'https://dev.to/{}' },
  { name: 'Codepen', url: 'https://codepen.io/{}' },
  { name: 'Lichess', url: 'https://lichess.org/@/{}' },
  { name: 'Faceit', url: 'https://faceit.com/en/players/{}' },
  { name: 'Behance', url: 'https://behance.net/{}' },
  { name: 'Dribbble', url: 'https://dribbble.com/{}' },
  { name: 'Deviantart', url: 'https://deviantart.com/{}' },
  { name: 'ArtStation', url: 'https://artstation.com/{}' },
  { name: 'Medium', url: 'https://medium.com/@{}' },
  { name: 'Patreon', url: 'https://patreon.com/{}' },
  { name: 'Ko-fi', url: 'https://ko-fi.com/{}' },
  { name: 'Linktree', url: 'https://linktr.ee/{}' },
];

async function runSherlock(pseudo) {
  const results = await Promise.all(SITES.map(async site => {
    const url = site.url.replace(/\{\}/g, pseudo);
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
  }));
  const found = results.filter(r => r.found);
  const notFound = results.filter(r => !r.found);
  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`🔍 Sherlock — "${pseudo}"`)
    .setDescription(`**${found.length}** compte(s) trouvé(s) sur ${SITES.length} sites`)
    .addFields(
      { name: '✅ Trouvé', value: found.length > 0 ? found.map(r => `[${r.name}](${r.url})`).join('\n') : 'Aucun compte trouvé' },
      { name: '❌ Non trouvé', value: notFound.map(r => r.name).join(', ') || 'Aucun' }
    )
    .setTimestamp()
    .setFooter({ text: 'OSINT Lookup' });
}

async function runWhois(domain) {
  try {
    const res = await fetch(`https://api.whois.vu/?q=${domain}`);
    const text = await res.text();
    return new EmbedBuilder()
      .setColor(0x00BFFF)
      .setTitle(`🌐 Whois — ${domain}`)
      .setDescription('```' + text.slice(0, 1800) + '```')
      .setTimestamp()
      .setFooter({ text: 'OSINT Lookup' });
  } catch {
    return new EmbedBuilder().setColor(0xFF0000).setDescription('❌ Erreur lors de la recherche Whois.');
  }
}

async function runIP(ip) {
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?lang=fr`);
    const data = await res.json();
    if (data.status === 'fail') throw new Error();
    return new EmbedBuilder()
      .setColor(0xFFA500)
      .setTitle(`📍 IP Lookup — ${ip}`)
      .addFields(
        { name: '🌍 Pays', value: data.country || 'Inconnu', inline: true },
        { name: '🏙️ Ville', value: data.city || 'Inconnu', inline: true },
        { name: '📡 FAI', value: data.isp || 'Inconnu', inline: true },
        { name: '🗺️ Région', value: data.regionName || 'Inconnu', inline: true },
        { name: '🕐 Timezone', value: data.timezone || 'Inconnu', inline: true },
        { name: '📮 Code postal', value: data.zip || 'Inconnu', inline: true },
      )
      .setTimestamp()
      .setFooter({ text: 'OSINT Lookup' });
  } catch {
    return new EmbedBuilder().setColor(0xFF0000).setDescription('❌ IP invalide ou introuvable.');
  }
}

async function runGitHub(username) {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    return new EmbedBuilder()
      .setColor(0x333333)
      .setTitle(`👤 GitHub — ${data.login}`)
      .setThumbnail(data.avatar_url)
      .setURL(data.html_url)
      .addFields(
        { name: '📛 Nom', value: data.name || 'Non renseigné', inline: true },
        { name: '🏢 Entreprise', value: data.company || 'Non renseigné', inline: true },
        { name: '📍 Localisation', value: data.location || 'Non renseigné', inline: true },
        { name: '📦 Repos publics', value: String(data.public_repos), inline: true },
        { name: '👥 Followers', value: String(data.followers), inline: true },
        { name: '👣 Following', value: String(data.following), inline: true },
        { name: '📅 Inscrit le', value: new Date(data.created_at).toLocaleDateString('fr-FR'), inline: true },
        { name: '📝 Bio', value: data.bio || 'Aucune bio', inline: false },
      )
      .setTimestamp()
      .setFooter({ text: 'OSINT Lookup' });
  } catch {
    return new EmbedBuilder().setColor(0xFF0000).setDescription('❌ Profil GitHub introuvable.');
  }
}

async function runSteam(username) {
  return new EmbedBuilder()
    .setColor(0x1B2838)
    .setTitle(`🎮 Steam — ${username}`)
    .setURL(`https://steamcommunity.com/id/${username}`)
    .setDescription(`[Voir le profil Steam](https://steamcommunity.com/id/${username})\n\n> Clique sur le lien pour voir le profil directement.`)
    .setTimestamp()
    .setFooter({ text: 'OSINT Lookup' });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('lookup')
    .setDescription('🔎 Ouvre le panel OSINT'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(0x5865F2)
      .setTitle('🔎 OSINT Lookup')
      .setDescription('Choisis un outil dans le menu ci-dessous.\nLes résultats te seront envoyés en **MP**.')
      .addFields(
        { name: '🔍 Sherlock', value: 'Recherche un pseudo sur 40+ réseaux', inline: true },
        { name: '🌐 Whois', value: 'Infos sur un nom de domaine', inline: true },
        { name: '📍 IP Lookup', value: 'Localisation d\'une adresse IP', inline: true },
        { name: '👤 GitHub', value: 'Infos d\'un profil GitHub', inline: true },
        { name: '🎮 Steam', value: 'Profil Steam d\'un joueur', inline: true },
      )
      .setTimestamp()
      .setFooter({ text: 'OSINT Lookup • Résultats envoyés en MP' });

    const menu = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId('osint_select')
        .setPlaceholder('→ Choisissez un outil...')
        .addOptions([
          { label: 'Sherlock', description: 'Recherche un pseudo sur les réseaux sociaux', value: 'sherlock', emoji: '🔍' },
          { label: 'Whois', description: 'Infos sur un nom de domaine', value: 'whois', emoji: '🌐' },
          { label: 'IP Lookup', description: 'Localisation d\'une adresse IP', value: 'ip', emoji: '📍' },
          { label: 'GitHub', description: 'Infos d\'un profil GitHub', value: 'github', emoji: '👤' },
          { label: 'Steam', description: 'Profil Steam d\'un joueur', value: 'steam', emoji: '🎮' },
        ])
    );

    await interaction.reply({ embeds: [embed], components: [menu] });
  },

  async handleSelect(interaction) {
    const tool = interaction.values[0];
    const modal = new ModalBuilder()
      .setCustomId(`osint_modal_${tool}`)
      .setTitle(
        tool === 'sherlock' ? '🔍 Sherlock — Pseudo' :
        tool === 'whois'    ? '🌐 Whois — Domaine' :
        tool === 'ip'       ? '📍 IP Lookup — Adresse IP' :
        tool === 'github'   ? '👤 GitHub — Pseudo' :
                              '🎮 Steam — Pseudo'
      );

    const input = new TextInputBuilder()
      .setCustomId('osint_input')
      .setLabel(
        tool === 'sherlock' ? 'Pseudo à rechercher' :
        tool === 'whois'    ? 'Nom de domaine (ex: google.com)' :
        tool === 'ip'       ? 'Adresse IP (ex: 8.8.8.8)' :
        tool === 'github'   ? 'Pseudo GitHub' :
                              'Pseudo Steam'
      )
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  },

  async handleModal(interaction) {
    const tool = interaction.customId.replace('osint_modal_', '');
    const value = interaction.fields.getTextInputValue('osint_input');

    await interaction.reply({ content: '⏳ Recherche en cours... Tu vas recevoir les résultats en MP !', ephemeral: true });

    let embed;
    if (tool === 'sherlock')    embed = await runSherlock(value);
    else if (tool === 'whois')  embed = await runWhois(value);
    else if (tool === 'ip')     embed = await runIP(value);
    else if (tool === 'github') embed = await runGitHub(value);
    else if (tool === 'steam')  embed = await runSteam(value);

    try {
      await interaction.user.send({ embeds: [embed] });
    } catch {
      await interaction.followUp({ content: '❌ Active tes MPs pour recevoir les résultats !', ephemeral: true });
    }
  },
};
