const { Client, CommandInteraction, MessageEmbed } = require("discord.js");
const {
    confirmButtons,
    modLog,
    randomHex,
} = require("../../handler/functions");
const { fail, success } = require("../../config.json");

module.exports = {
    name: "kick",
    description: "kick a member",
    category: "mod",
    options: [
        {
            name: "target",
            description: "target to kick",
            type: "USER",
            required: true,
        },
        {
            name: "reason",
            description: "reason for this kick",
            type: "STRING",
            required: false,
        },
    ],

    run: async (client, interaction) => {
        const target = interaction.options.getMember("target");
        const reason =
            interaction.options.getString("reason") || "`No Reason Provided`";

        if (target.id === interaction.member.id)
            return interaction.followUp({
                content: `${fail} You cant kick yourself`,
            });

        if (target.id === interaction.guild.me.id)
            return interaction.followUp({
                content: `${fail} You cant kick me`,
            });

        if (target.id === interaction.guild.ownerId)
            return interaction.followUp({
                content: `${fail} You cannot kick the server owner`,
            });

        if (
            target.roles.highest.position >=
            interaction.member.roles.highest.position
        )
            return interaction.followUp({
                content: `${fail} This user is higher/equal than you`,
            });

        if (
            target.roles.highest.position >=
            interaction.guild.me.roles.highest.position
        )
            return interaction.followUp({
                content: `${fail} This user is higher/equal than me`,
            });

        const embed = new MessageEmbed()
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL({
                    dynamic: true,
                }),
            })
            .setDescription(
                `**${interaction.user.tag}** are you sure you want to kick **${target.user.tag}**`
            )
            .setFooter({
                text: client.user.tag,
                iconURL: client.user.displayAvatarURL(),
            })
            .setColor(randomHex())
            .setTimestamp();

        confirmButtons(interaction, {
            embed: embed,
            authorOnly: `Only <@${interaction.member.id}> can use these buttons`,
            yes: {
                style: "SUCCESS",
                label: "Kick",
                emoji: "✔️",
            },
            no: {
                style: "SECONDARY",
                label: "No",
                emoji: "🛑",
            },
        }).then(async (confirm) => {
            if (confirm === "yes") {
                await target.kick(reason);
                interaction.editReply({
                    content: `${success} Kicked **${target.user.tag}** successfully!`,
                });
                modLog(interaction, reason, {
                    Action: "`Kick`",
                    Member: `\`${target.user.tag}\``,
                });
            }
            if (confirm === "no") {
                interaction.editReply({
                    content: `${fail} **${target.user.tag}** hasn't been kicked!`,
                });
            }
            if (confirm === "time") {
                interaction.editReply({
                    content: `${fail} Time is up`,
                });
            }
        });
    },
};
