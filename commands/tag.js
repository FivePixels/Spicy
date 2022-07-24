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
        const responseEmbed = new EmbedBuilder();
        const subcommand = interaction.options.subcommand;
        const name = interaction.options.getString('name');
        const content = interaction.options.getString('content');
        const attachment = interaction.options.getAttachment('attachment');
        const Tag = mongoose.model('Tag', tagSchema);
        switch (subcommand) {
            case "delete":
                deleteTag(name);
                break;
            case "edit":
                updateTag(name);
                break;
            default: // create
                createTag(name, content, attachment);
                break;
        }

        function createTag(name, content, attachment) {
            const attachUrl = attachment == null ? null : attachment.url;
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
                    upsert: false
                }
                );
            responseEmbed.setTitle("Tag created");
            responseEmbed.setDescription("The " + name + " tag was created successfully.");
            interaction.reply({embeds: [responseEmbed]});
        }

        function deleteTag(name) {
            Tag.deleteOne({ name: name });
        }

        function updateTag(name, content, attachment) {
            const attachUrl = attachment == null ? null : attachment.url;
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
            responseEmbed.setTitle("Tag updated");
            responseEmbed.setDescription("The " + name + " tag was updated successfully.");
            interaction.reply({embeds: [responseEmbed]});
        }
	},
};