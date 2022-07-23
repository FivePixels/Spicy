const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');
const { default: mongoose } = require('mongoose');
const { tagSchema } = require('../database/schema/Tag.js');
module.exports = {
	data: new SlashCommandBuilder()
		.setName('tag')
		.setDescription('Commands related to tagging')
        .addSubcommand(subcommand => {
            return subcommand
            .setName("create")
            .setDescription("Create a new tag")
            .addStringOption(option => {
                return option
                .setName("name")
                .setDescription("The name of the tag")
                .setRequired(true);
            })
            .addStringOption(option => {
                return option
                .setName("content")
                .setDescription("The content of the tag")
                .setRequired(true);
            })
            .addAttachmentOption(option => {
                return option
                .setName("attachment")
                .setDescription("The attachment of the tag")
                .setRequired(false);
            })
        })
        .addSubcommand(subcommand => {
            return subcommand
            .setName("delete")
            .setDescription("Delete a tag")
            .addStringOption(option => {
                return option
                .setName("name")
                .setDescription("The name of the tag")
                .setRequired(true);
            })
        })
        .addSubcommand(subcommand => {
            return subcommand
            .setName("edit")
            .setDescription("Edit an existing tag")
            .addStringOption(option => {
                return option
                .setName("name")
                .setDescription("The name of the tag")
                .setRequired(true);
            })
            .addStringOption(option => {
                return option
                .setName("content")
                .setDescription("The content of the tag")
                .setRequired(true);
            })
            .addAttachmentOption(option => {
                return option
                .setName("attachment")
                .setDescription("The attachment of the tag")
                .setRequired(false);
            })
        })
        ,
	async execute(interaction) {
        await interaction.deferReply();
        const subcommand = interaction.options.subcommand;
        const name = interaction.options.getString('name');
        const Tag = mongoose.model('Tag', tagSchema);
        switch (subcommand) {
            case "delete":
                deleteTag(name);
                break;
            case "edit":
            default: // create
                const content = interaction.options.getString('content');
                const attachment = interaction.options.getAttachment('attachment');
                upsertTag(name, content, attachment);
                break;
        }

        function deleteTag(name) {
            Tag.deleteOne(
                {
                    name: name
                }
           )
        }

        function upsertTag(name, content, attachment) {
            // update/insert tag
            // after rereading this logic, we probably wont want upsert logic, since create and edit are two separate commands
            const attachUrl = attachment == null ? null : attachment.url;
            const responseEmbed = new EmbedBuilder();
            const res = Tag.updateOne(
                {
                    name: name
                },
                {
                    $set: {
                        content: content,
                        attachmentURL: attachUrl
                    }
                },
                {
                    upsert: true
                }
            )
            if (res.modifiedCount > 0) {
                responseEmbed.setTitle("Tag updated")
                responseEmbed.setDescription("The " + name + " tag was created successfully.")
            } else {
                responseEmbed.setTitle("Tag created")
                responseEmbed.setDescription("The " + name + " tag was updated successfully.")
            }
            console.log('made it here')
            interaction.reply({embeds: [responseEmbed]});
        }
	},
};