const {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  EmbedBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
} = require('discord.js');

const TICKET_TYPES = {
  questions: {
    label: 'Questions',
    description: 'Ouvrir un ticket pour poser une question',
    emoji: '❓',
  },
  partenariat: {
    label: 'Partenariat',
    description: 'Ouvrir un ticket pour une demande de partenariat',
    emoji: '🤝',
  },
  report: {
    label: 'Report',
    description: 'Ouvrir un ticket pour signaler un probleme',
    emoji: '🚨',
  },
  role: {
    label: 'Obtenir mon role',
    description: 'Ouvrir un ticket pour demander un role',
    emoji: '🎭',
  },
  autre: {
    label: 'Autre',
    description: 'Ouvrir un ticket pour une autre demande',
    emoji: '📩',
  },
};

const TICKET_ROLE_NAME = 'ticket';

function findTicketRole(guild) {
  return guild.roles.cache.find(role => role.name.toLowerCase() === TICKET_ROLE_NAME);
}

function buildPanel(ticketRole, transcriptChannel) {
  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle('Support tickets')
    .setDescription('Choisis le type de ticket dont tu as besoin dans le menu ci-dessous.')
    .addFields(
      { name: 'Role tickets', value: `${ticketRole}`, inline: true },
      { name: 'Transcripts', value: `${transcriptChannel}`, inline: true },
    )
    .setTimestamp();

  const menu = new StringSelectMenuBuilder()
    .setCustomId(`ticket_type_select:${transcriptChannel.id}`)
    .setPlaceholder('Choisis un type de ticket...')
    .addOptions(
      Object.entries(TICKET_TYPES).map(([value, type]) => ({
        label: type.label,
        description: type.description,
        value,
        emoji: type.emoji,
      })),
    );

  return {
    embeds: [embed],
    components: [new ActionRowBuilder().addComponents(menu)],
  };
}

function buildTicketControls(claimedById = null) {
  const claimButton = new ButtonBuilder()
    .setCustomId('ticket_claim')
    .setLabel(claimedById ? 'Ticket claim' : 'Claim')
    .setStyle(claimedById ? ButtonStyle.Secondary : ButtonStyle.Primary)
    .setDisabled(Boolean(claimedById));

  const closeButton = new ButtonBuilder()
    .setCustomId('ticket_close')
    .setLabel('Close')
    .setStyle(ButtonStyle.Danger);

  return [new ActionRowBuilder().addComponents(claimButton, closeButton)];
}

function sanitizeChannelName(value) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'membre';
}

function getTicketMeta(channel) {
  const topic = channel.topic || '';
  const meta = {};

  for (const part of topic.split(' | ')) {
    const [key, value] = part.split(':');
    if (key && value) meta[key] = value;
  }

  return meta;
}

function buildTicketTopic(meta) {
  return [
    'ticket',
    `user:${meta.user}`,
    `type:${meta.type}`,
    `role:${meta.role}`,
    `logs:${meta.logs}`,
    meta.claimed ? `claimed:${meta.claimed}` : null,
  ].filter(Boolean).join(' | ');
}

function canManageTicket(member, ticketRoleId) {
  return member.roles.cache.has(ticketRoleId) || member.permissions.has(PermissionFlagsBits.ManageChannels);
}

async function fetchAllMessages(channel) {
  const messages = [];
  let before;

  while (true) {
    const batch = await channel.messages.fetch({ limit: 100, before });
    if (batch.size === 0) break;

    messages.push(...batch.values());
    before = batch.last().id;
  }

  return messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
}

async function createTranscript(channel, meta, closedBy) {
  const messages = await fetchAllMessages(channel);
  const type = TICKET_TYPES[meta.type]?.label || meta.type || 'Inconnu';

  const lines = [
    `Transcript du ticket: #${channel.name}`,
    `Type: ${type}`,
    `Ouvert par: ${meta.user || 'Inconnu'}`,
    `Claim par: ${meta.claimed || 'Non claim'}`,
    `Ferme par: ${closedBy.user.tag} (${closedBy.id})`,
    `Date: ${new Date().toLocaleString('fr-FR')}`,
    '',
    'Messages:',
    '---------',
  ];

  for (const message of messages) {
    const attachments = message.attachments.size
      ? ` | Pieces jointes: ${message.attachments.map(attachment => attachment.url).join(', ')}`
      : '';
    const content = message.content || '[embed/fichier/sans texte]';
    lines.push(`[${message.createdAt.toLocaleString('fr-FR')}] ${message.author.tag}: ${content}${attachments}`);
  }

  return new AttachmentBuilder(Buffer.from(lines.join('\n'), 'utf8'), {
    name: `transcript-${channel.name}.txt`,
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket-panel')
    .setDescription('Cree un panel de tickets dans ce salon')
    .addChannelOption(option =>
      option
        .setName('transcripts')
        .setDescription('Salon ou envoyer les transcripts')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true),
    )
    .addChannelOption(option =>
      option
        .setName('categorie')
        .setDescription('Categorie ou creer les tickets')
        .addChannelTypes(ChannelType.GuildCategory)
        .setRequired(false),
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    const transcriptChannel = interaction.options.getChannel('transcripts');
    const category = interaction.options.getChannel('categorie');
    const ticketRole = findTicketRole(interaction.guild);

    if (!ticketRole) {
      return interaction.reply({
        content: `Cree d abord un role Discord nomme exactement "${TICKET_ROLE_NAME}", puis relance la commande.`,
        ephemeral: true,
      });
    }

    const panel = buildPanel(ticketRole, transcriptChannel);
    const message = await interaction.channel.send(panel);

    if (category) {
      const menu = StringSelectMenuBuilder.from(message.components[0].components[0])
        .setCustomId(`ticket_type_select:${transcriptChannel.id}:${category.id}`);
      await message.edit({ components: [new ActionRowBuilder().addComponents(menu)] });
    }

    await interaction.reply({ content: 'Panel de tickets cree dans ce salon.', ephemeral: true });
  },

  async handleSelect(interaction) {
    const [, transcriptChannelId, categoryId] = interaction.customId.split(':');
    const typeKey = interaction.values[0];
    const type = TICKET_TYPES[typeKey] || TICKET_TYPES.autre;
    const guild = interaction.guild;
    const ticketRole = findTicketRole(guild);

    if (!ticketRole) {
      return interaction.reply({
        content: `Le role "${TICKET_ROLE_NAME}" est introuvable. Cree ce role puis reessaie.`,
        ephemeral: true,
      });
    }

    const existingTicket = guild.channels.cache.find(channel =>
      channel.type === ChannelType.GuildText &&
      channel.topic?.includes('ticket') &&
      channel.topic?.includes(`user:${interaction.user.id}`),
    );

    if (existingTicket) {
      return interaction.reply({
        content: `Tu as deja un ticket ouvert: ${existingTicket}`,
        ephemeral: true,
      });
    }

    const channelName = `ticket-${typeKey}-${sanitizeChannelName(interaction.user.username)}`;
    const ticketChannel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      parent: categoryId || interaction.channel.parentId || null,
      topic: buildTicketTopic({
        user: interaction.user.id,
        type: typeKey,
        role: ticketRole.id,
        logs: transcriptChannelId,
      }),
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.AttachFiles,
          ],
        },
        {
          id: ticketRole.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageMessages,
          ],
        },
        {
          id: guild.members.me.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.AttachFiles,
          ],
        },
      ],
    });

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle(`${type.emoji} Ticket ${type.label}`)
      .setDescription(`${interaction.user}, explique ta demande ici. Un membre avec le role ticket va te repondre.`)
      .addFields(
        { name: 'Type', value: type.label, inline: true },
        { name: 'Statut', value: 'En attente de claim', inline: true },
      )
      .setTimestamp();

    await ticketChannel.send({
      content: `${interaction.user} ${ticketRole}`,
      embeds: [embed],
      components: buildTicketControls(),
    });

    await interaction.reply({
      content: `Ton ticket a ete cree: ${ticketChannel}`,
      ephemeral: true,
    });
  },

  async handleButton(interaction) {
    const meta = getTicketMeta(interaction.channel);
    const ticketRoleId = meta.role || meta.staff;

    if (!meta.user || !ticketRoleId || !meta.logs) {
      return interaction.reply({ content: 'Ce salon ne ressemble pas a un ticket valide.', ephemeral: true });
    }

    const isTicketOwner = interaction.user.id === meta.user;
    const canManage = canManageTicket(interaction.member, ticketRoleId);

    if (interaction.customId === 'ticket_claim') {
      if (!canManage) {
        return interaction.reply({ content: 'Il faut le role ticket pour claim ce ticket.', ephemeral: true });
      }

      if (meta.claimed) {
        return interaction.reply({ content: `Ce ticket est deja claim par <@${meta.claimed}>.`, ephemeral: true });
      }

      const updatedMeta = { ...meta, role: ticketRoleId, claimed: interaction.user.id };
      await interaction.channel.setTopic(buildTicketTopic(updatedMeta));

      const embed = EmbedBuilder.from(interaction.message.embeds[0])
        .setFields(
          { name: 'Type', value: TICKET_TYPES[meta.type]?.label || meta.type, inline: true },
          { name: 'Statut', value: `Claim par ${interaction.user}`, inline: true },
        );

      await interaction.update({
        embeds: [embed],
        components: buildTicketControls(interaction.user.id),
      });

      await interaction.followUp({ content: `${interaction.user} a claim ce ticket.` });
      return;
    }

    if (interaction.customId === 'ticket_close') {
      if (!canManage && !isTicketOwner) {
        return interaction.reply({ content: 'Tu ne peux pas fermer ce ticket.', ephemeral: true });
      }

      await interaction.deferReply({ ephemeral: true });

      try {
        const logsChannel = await interaction.guild.channels.fetch(meta.logs).catch(() => null);

        if (!logsChannel || logsChannel.type !== ChannelType.GuildText) {
          return interaction.editReply('Impossible de fermer: le salon transcripts est introuvable.');
        }

        const botMember = interaction.guild.members.me;
        const botPermissions = logsChannel.permissionsFor(botMember);

        if (!botPermissions?.has(PermissionFlagsBits.ViewChannel) || !botPermissions?.has(PermissionFlagsBits.SendMessages)) {
          return interaction.editReply('Impossible de fermer: je n ai pas la permission d envoyer le transcript dans le salon transcripts.');
        }

        const transcript = await createTranscript(interaction.channel, meta, interaction.user);
        const ticketOwner = await interaction.client.users.fetch(meta.user).catch(() => null);
        const type = TICKET_TYPES[meta.type]?.label || meta.type || 'Inconnu';

        const logEmbed = new EmbedBuilder()
          .setColor(0xED4245)
          .setTitle('Ticket ferme')
          .addFields(
            { name: 'Salon', value: `#${interaction.channel.name}`, inline: true },
            { name: 'Type', value: type, inline: true },
            { name: 'Ouvert par', value: ticketOwner ? `${ticketOwner.tag} (${ticketOwner.id})` : meta.user, inline: false },
            { name: 'Claim par', value: meta.claimed ? `<@${meta.claimed}>` : 'Non claim', inline: true },
            { name: 'Ferme par', value: `${interaction.user.tag} (${interaction.user.id})`, inline: true },
          )
          .setTimestamp();

        await logsChannel.send({ embeds: [logEmbed], files: [transcript] });

        await interaction.editReply('Ticket ferme. Transcript envoye, suppression du salon dans 5 secondes.');
        setTimeout(() => {
          interaction.channel.delete(`Ticket ferme par ${interaction.user.tag}`).catch(() => null);
        }, 5000);
      } catch (err) {
        console.error('Erreur fermeture ticket:', err);
        await interaction.editReply('Erreur pendant la fermeture du ticket. Verifie mes permissions puis reessaie.');
      }
    }
  },
};
