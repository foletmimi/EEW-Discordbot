const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("botの応答速度を計測"),
  async execute(interaction) {
    try {
      const sent = await interaction.reply({
        content: "Pinging...",
        fetchReply: true,
      });
      interaction.editReply(
        `Roundtrip latency: ${
          sent.createdTimestamp - interaction.createdTimestamp
        }ms`
      );
    } catch (e) {
      console.error(e);
    }
  },
};
