# 🤖 Guide de déploiement — Mon Bot Discord

## Étape 1 — Créer le bot sur Discord Developer Portal

1. Va sur **https://discord.com/developers/applications**
2. Clique **"New Application"** → donne un nom → **"Create"**
3. Dans le menu gauche, clique **"Bot"**
4. Clique **"Add Bot"** → confirme
5. Active ces 3 options :
   - ✅ **Presence Intent**
   - ✅ **Server Members Intent**
   - ✅ **Message Content Intent**
6. Clique **"Reset Token"** → copie le token (tu en auras besoin)

---

## Étape 2 — Inviter le bot sur ton serveur

1. Dans le menu gauche, clique **"OAuth2"** > **"URL Generator"**
2. Coche **"bot"** et **"applications.commands"**
3. Dans les permissions, coche ce dont tu as besoin :
   - Send Messages, Embed Links, Read Message History
   - Kick Members, Ban Members, Manage Messages (modération)
4. Copie le lien généré → ouvre-le → sélectionne ton serveur

---

## Étape 3 — Configurer le projet en local

### Pré-requis
- **Node.js** v18+ → https://nodejs.org (télécharge la version LTS)
- Un éditeur : **VS Code** → https://code.visualstudio.com

### Installation
```bash
# Ouvre un terminal dans le dossier du bot, puis :
npm install
```

### Configurer les identifiants
Crée un fichier `.env` (copie `.env.example`) et remplis-le :
```env
TOKEN=ton_token_bot_ici
CLIENT_ID=ton_client_id_ici
GUILD_ID=ton_guild_id_ici
```

**Où trouver ces valeurs ?**
- `TOKEN` → Discord Developer Portal > Bot > Reset Token
- `CLIENT_ID` → Developer Portal > OAuth2 > Client ID (le grand numéro)
- `GUILD_ID` → Discord : clic droit sur ton serveur > "Copier l'identifiant"
  *(Active le mode développeur dans Paramètres > Avancés > Mode développeur)*

---

## Étape 4 — Déployer les commandes slash

```bash
node deploy-commands.js
```

Tu dois voir : `✅ Commandes déployées avec succès !`
Les commandes apparaissent sur Discord en quelques secondes.

---

## Étape 5 — Lancer le bot en local (pour tester)

```bash
npm start
# ou en mode watch (relance auto si tu modifies le code) :
npm run dev
```

Tu dois voir :
```
✅ Commande chargée : /help
✅ Commande chargée : /ping
...
🤖 Connecté en tant que MonBot#1234
```

---

## Étape 6 — Héberger le bot 24h/24 (GRATUIT)

### Option A — Railway (recommandé, le plus simple)

1. Crée un compte sur **https://railway.app** (connexion via GitHub)
2. Clique **"New Project"** > **"Deploy from GitHub repo"**
3. Connecte ton GitHub et sélectionne ton repo
   *(Si pas de repo : crée-en un sur github.com et push le code)*
4. Dans Railway, va dans ton projet > onglet **"Variables"**
5. Ajoute tes 3 variables : `TOKEN`, `CLIENT_ID`, `GUILD_ID`
6. Railway lance automatiquement `npm start` → ton bot tourne !

**Push de ton code sur GitHub :**
```bash
git init
git add .
git commit -m "Premier commit du bot"
git branch -M main
git remote add origin https://github.com/TON_USERNAME/TON_REPO.git
git push -u origin main
```

### Option B — Render (aussi gratuit)

1. **https://render.com** → New > Web Service
2. Connecte ton repo GitHub
3. Build Command : `npm install`
4. Start Command : `node index.js`
5. Ajoute les variables d'environnement dans "Environment"

> ⚠️ Sur Render gratuit, le service "dort" après 15 min d'inactivité.
> Pour éviter ça, utilise Railway ou passe en plan payant.

### Option C — Ton PC local (pour le dev uniquement)

Laisse juste `npm start` tourner. Le bot s'arrête si tu fermes le terminal.

---

## Structure des fichiers

```
discord-bot/
├── index.js              ← Point d'entrée du bot
├── deploy-commands.js    ← Script de déploiement des slash commands
├── package.json
├── .env                  ← Tes secrets (NE PAS commit sur GitHub !)
├── .gitignore            ← Ignore node_modules et .env
├── commands/
│   ├── help.js
│   ├── ping.js
│   ├── userinfo.js
│   ├── serverinfo.js
│   ├── avatar.js
│   ├── poll.js
│   ├── clear.js
│   ├── kick.js
│   └── ban.js
└── events/
    ├── ready.js
    ├── interactionCreate.js
    └── guildMemberAdd.js
```

---

## Ajouter une nouvelle commande (exemple)

Crée `commands/hello.js` :
```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hello')
    .setDescription('Dit bonjour !'),

  async execute(interaction) {
    await interaction.reply(`👋 Salut ${interaction.user.username} !`);
  },
};
```

Puis relance `node deploy-commands.js` pour l'enregistrer.

---

## Problèmes fréquents

| Problème | Solution |
|----------|----------|
| `Invalid token` | Vérifie le TOKEN dans `.env` |
| Les commandes n'apparaissent pas | Relance `node deploy-commands.js` |
| `Missing Permissions` | Le bot n'a pas le bon rôle sur le serveur |
| `Cannot read properties of null` | GUILD_ID incorrect dans `.env` |
| Le bot ne répond pas au kick/ban | Mets le rôle du bot AU-DESSUS de la victime |
