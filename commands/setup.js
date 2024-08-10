const {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
  SlashCommandBuilder,
  ComponentType,
} = require("discord.js");
const fs = require("fs");

var shindo_values = 0;
var magni_values = 0;
var col = "none";
var thr_id = 0;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setup")
    .setDescription(
      "コマンドを実行したチャンネルでeew発生時の通知の設定をします"
    ),
  async execute(interaction) {
    try {
      const shindo = new StringSelectMenuBuilder()
        .setCustomId(interaction.id)
        .setPlaceholder("Make a selection!")
        .setMinValues(0)
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("1以上")
            .setDescription("震度が1かそれ以上の場合は送信する")
            .setValue("10"),
          new StringSelectMenuOptionBuilder()
            .setLabel("3以上")
            .setDescription("震度が3かそれ以上の場合は送信する")
            .setValue("30"),
          new StringSelectMenuOptionBuilder()
            .setLabel("4以上")
            .setDescription("震度が4かそれ以上の場合は送信する")
            .setValue("40"),
          new StringSelectMenuOptionBuilder()
            .setLabel("5")
            .setDescription("震度が5弱かそれ以上の場合は送信する")
            .setValue("50")
        );

      const magni = new StringSelectMenuBuilder()
        .setCustomId(interaction.id)
        .setPlaceholder("Make a selection!")
        .setMinValues(0)
        .addOptions(
          new StringSelectMenuOptionBuilder()
            .setLabel("すべて")
            .setDescription("EEW発生時、即座に送信する")
            .setValue("1"),
          new StringSelectMenuOptionBuilder()
            .setLabel("M4以上")
            .setDescription("マグニチュードが5かそれ以上の場合は送信する")
            .setValue("4"),
          new StringSelectMenuOptionBuilder()
            .setLabel("M5以上")
            .setDescription("マグニチュードが5かそれ以上の場合は送信する")
            .setValue("5"),
          new StringSelectMenuOptionBuilder()
            .setLabel("M6以上")
            .setDescription("マグニチュードが6かそれ以上の場合は送信する")
            .setValue("6"),
          new StringSelectMenuOptionBuilder()
            .setLabel("M7")
            .setDescription("マグニチュードが7かそれ以上の場合は送信する")
            .setValue("7")
        );

      const row_shindo = new ActionRowBuilder().addComponents(shindo);
      const row_magni = new ActionRowBuilder().addComponents(magni);

      var reply = await interaction.reply({
        content: "最大震度設定",
        components: [row_shindo],
      });
      col = 0;

      const collector = reply.createMessageComponentCollector({
        componentType: ComponentType.StringSelect,
        filter: (i) =>
          i.user.id === interaction.user.id && i.customId === interaction.id,
        time: 60_000,
      });
      collector.on("collect", async (interaction) => {
        if (col == 0) {
          shindo_values = interaction.values[0];
          reply = await interaction.reply({
            content: "マグニチュード設定",
            components: [row_magni],
          });
          col = 1;
        } else {
          magni_values = interaction.values[0];
          await interaction.reply({
            content:
              "設定が完了しました。以降次のスレッドチャンネルにてEEWが送信されます",
          });
          await interaction.channel.threads
            .create({
              name: "Earthquake",
              autoArchiveDuration: 10080, //アーカイブまで一週間
              reason: "地震情報を送信",
            })
            .then((res) => {
              thr_id = res.id;
            });
          console.log(shindo_values, magni_values, thr_id);
          await writeFile(thr_id, shindo_values, magni_values);
          interaction.client.channels.cache.get(thr_id).send("送信確認用");
        }
      });
    } catch (e) {
      console.error(e);
    }
  },
};

async function writeFile(thid, shinvl, magnvl) {
  try {
    const data = [
      {
        thr_Id: thid,
        shindo_value: shinvl,
        magni_value: magnvl,
      },
    ];
    // JSONファイルのパス
    const filePath = `${process.cwd()}/data/data2.json`;

    // 既存のデータを配列として読み込む
    let existingData = [];
    if (fs.existsSync(filePath)) {
      try {
        existingData = JSON.parse(fs.readFileSync(filePath));
        // 既存のデータが配列でない場合は空の配列で初期化
        if (!Array.isArray(existingData)) {
          existingData = [];
        }
      } catch (err) {
        console.error("JSONファイルの読み込みに失敗しました:", err);
        return;
      }
    }

    // 新しいデータを既存のデータに追加
    existingData.push(...data);

    // ファイルに書き込む
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    console.log("データが追記されました");
  } catch (err) {
    console.error("エラーが発生しました:", err);
  }
}
