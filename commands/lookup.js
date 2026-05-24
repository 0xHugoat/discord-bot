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
    const res = await fetch(`https://ipwho.is/${ip}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || 'IP invalide');
    return new EmbedBuilder()
      .setColor(0xFFA500)
      .setTitle(`📍 IP Lookup — ${ip}`)
      .addFields(
        { name: '🌍 Pays', value: `${data.flag?.emoji || ''} ${data.country || 'Inconnu'}`, inline: true },
        { name: '🏙️ Ville', value: data.city || 'Inconnu', inline: true },
        { name: '📡 FAI', value: data.connection?.isp || 'Inconnu', inline: true },
        { name: '🗺️ Région', value: data.region || 'Inconnu', inline: true },
        { name: '🕐 Timezone', value: data.timezone?.id || 'Inconnu', inline: true },
        { name: '📮 Code postal', value: data.postal || 'Inconnu', inline: true },
        { name: '🌐 ASN', value: data.connection?.asn ? String(data.connection.asn) : 'Inconnu', inline: true },
        { name: '🏢 Organisation', value: data.connection?.org || 'Inconnu', inline: true },
        { name: '📡 Type', value: data.type || 'Inconnu', inline: true },
      )
      .setTimestamp()
      .setFooter({ text: 'OSINT Lookup' });
  } catch (err) {
    return new EmbedBuilder().setColor(0xFF0000).setDescription(`❌ IP invalide ou introuvable : ${err.message}`);
  }
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
                              '📍 IP Lookup — Adresse IP'
      );

    const input = new TextInputBuilder()
      .setCustomId('osint_input')
      .setLabel(
        tool === 'sherlock' ? 'Pseudo à rechercher' :
        tool === 'whois'    ? 'Nom de domaine (ex: google.com)' :
                              'Adresse IP (ex: 8.8.8.8)'
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
    if (tool === 'sherlock')   embed = await runSherlock(value);
    else if (tool === 'whois') embed = await runWhois(value);
    else if (tool === 'ip')    embed = await runIP(value);

    try {
      await interaction.user.send({ embeds: [embed] });
    } catch {
      await interaction.followUp({ content: '❌ Active tes MPs pour recevoir les résultats !', ephemeral: true });
    }
  },
};
