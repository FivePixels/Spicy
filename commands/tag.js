const { EmbedBuilder } = require('@discordjs/builders');
const { SlashCommandBuilder } = require('discord.js');
const { default: mongoose } = require('mongoose');
const { tagSchema } = require('../database/schema/Tag.js');
module.exports = {
	data: new SlashCommandBuilder()
        .setName('tag')
        .setDescription('Create and reuse embedded "tags"')
        .addStringOption((option)=> 
            option
                .setName("name")
                .setDescription("The name of the tag")
                .setRequired(false)
        )
        .addSubcommandGroup((group) => 
            group 
                .setName("tag")
                .setDescription("blah")
            .addSubcommand((create) => 
                 create
                .setName('create')
                .setDescription('Creates a new tag.')
                .addStringOption((option) => 
                    option
                        .setName("name")
                        .setDescription("That name of the tag.")
                        .setRequired(true)
                )
        
                .addStringOption((option) =>
                     option
                        .setName("content")
                        .setDescription("The content of the tag.")
                        .setRequired(true)
                )
                .addAttachmentOption((option) => 
                     option
                        .setName("attachment")
                        .setDescription("The attachment of the tag.")
                        .setRequired(false)
                )
            )
            .addSubcommand((del) =>
                del
                .setName('delete')
                .setDescription('Deletes a tag.')
                .addStringOption((option) =>
                    option
                        .setName("name")
                        .setDescription("The name of the tag.")
                        .setRequired(true)
                )
            )
            .addSubcommand((edit) =>
                edit
                .setName('edit')
                .setDescription('Edits a tag.')
                .addStringOption((option) =>
                    option
                        .setName("name")
                        .setDescription("The name of the tag.")
                        .setRequired(true)
                )
                .addStringOption((option) =>

                    option

                        .setName("content")
                        .setDescription("The content of the tag.")
                        .setRequired(true)
                )
                .addAttachmentOption((option) =>
                    option
                        .setName("attachment")
                        .setDescription("The attachment of the tag.")
                        .setRequired(false)
                )
            )
        ),
                // my output doesn't auto scroll this is annoying

        
	async execute(interaction) {
        const responseEmbed = new EmbedBuilder();
        const subcommand = interaction.options.subcommand;
        const name = interaction.options.getString('name');
        const content = interaction.options.getString('content');
        const attachment = interaction.options.getAttachment('attachment');
        const Tag = mongoose.model('Tag', tagSchema);
        switch (subcommand) {
            case "delete":
                await deleteTag(name);
                break;
            case "edit":
                await updateTag(name, content, attachment);
                break;
            case "create":
                await createTag(name, content, attachment);
                break;
            default:
                await sendTag(name);
                break;
        }

        async function createTag(name, content, attachment) {
            const attachUrl = attachment == null ? null : attachment.url;
             Tag.updateOne(
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

        async function deleteTag(name) {
            Tag.deleteOne({ name: name });
        }

        async function updateTag(name, content, attachment) {
            const attachUrl = attachment == null ? null : attachment.url;
            Tag.updateOne(
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

        async function sendTag(name) {
            const Tag = mongoose.model('Tag', tagSchema);
            Tag.findOne({ name: name }, function (err, tag) {
                if (err) {
                    console.log(err);
                } else {
                    if (tag == null) {
                        interaction.reply("Tag not found");
                    } else {
                        const embed = new EmbedBuilder();
                        embed.setTitle(tag.name);
                        embed.setDescription(tag.content);
                        if (tag.attachmentURL != null) {
                            embed.setImage(tag.attachmentURL);
                        }
                        interaction.reply({ embeds: [embed] });
                    }
                }
            }
            )
        }
	},

};