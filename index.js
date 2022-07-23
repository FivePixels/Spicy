const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, GatewayIntentBits } = require('discord.js');
const { token, mongoUri } = require('./config.json');
const { default: mongoose } = require('mongoose');

const discordClient = new Client({ intents: [GatewayIntentBits.Guilds] });

mongoose.connect(mongoUri, () => {
    console.log("Mongoose is connected and ready!")
    discordClient.login(token);
})

discordClient.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const commandFile of commandFiles) {
    const filePath = path.join(commandsPath, commandFile);
    const command = require(filePath);
    discordClient.commands.set(command.data.name, command);
}

discordClient.once('ready', () => {
	console.log('Spicy is ready!');
});

discordClient.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) return;

    const command = discordClient.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		await interaction.editReply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});
