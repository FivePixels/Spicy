const { EmbedBuilder, SlashCommandBuilder, ChannelType, } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('guide')
		.setDescription('Guides a user to a specific channel.')
        .addUserOption(option => {
            return option.setName("user")
            .setDescription("The user being guided to a channel")
            .setRequired(true);
        })
        .addChannelOption(option => {
            return option.setName("channel")
            .addChannelTypes(ChannelType.GuildText)
            .setRequired(true)
            .setDescription("The channel the user is being guided to");
        })
        .addBooleanOption(option => {
            return option.setName("embed")
            .setDescription("Send an embed for the user")
        }),
	async execute(interaction) {
        if (interaction.options.data[2]) {
            // TODO: embed logic here
        }
		await interaction.reply('Pong!');
	},
};