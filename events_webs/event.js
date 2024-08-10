const {
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
} = require("discord.js");
const { tsunami_class, shindo_class } = require(`./class.js`);
const { setTimeout } = require("timers/promises");
const data = require(`${process.cwd()}/data/data2.json`);

function onClose(message) {
  console.log("WebSocketの接続が切れました", message);
}

function onWMessage(message, client) {
  const msg = JSON.parse(message);
  switch (msg.type) {
    case "heartbeat":
      // console.log("heart", msg.type);
      break;
    case "jma_eew":
      // console.log(msg);
      // console.log("time: " + msg.OriginTime);
      // console.log("location: " + msg.Hypocenter);
      // console.log("magunitude: " + msg.Magunitude);
      // console.log("shindo: " + msg.MaxIntensity);
      // console.log("depth: " + msg.Depth);
      data.forEach((dt) => {
        if (
          dt.shindo_value <= msg.MaxIntensity ||
          dt.magni_value <= msg.Magunitude
        ) {
          eew_mes(
            dt.thr_Id,
            msg,
            msg.isWarn,
            msg.isFinal,
            msg.isCancel,
            client
          );
        }
      });
  }
  console.log("rowdata:", msg);
}

const link = new ButtonBuilder()
  .setLabel("p2p地震情報web版")
  .setURL("https://www.p2pquake.net/web/")
  .setStyle(ButtonStyle.Link);

const row = new ActionRowBuilder().setComponents(link);

async function onPMessage(message, client) {
  const json = JSON.parse(message);
  switch (json.code) {
    case 551:
      var shindo = json.earthquake.maxScale;
      var magni = json.earthquake.hypocenter.magnitude;
      data.forEach((dt) => {
        if (dt.shindo_value <= shindo || dt.magni_value <= magni) {
          quake_info(dt.thr_Id, message, client);
        } else {
        }
      });
  }
}

module.exports = { onWMessage, onPMessage, onClose };

function eew_mes(ch_id, msg, warn, final, cancel, client) {
  if (warn === true) {
    if (cancel === true) {
      client.channels.cache.get(ch_id).send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`緊急地震速報(警報) 最終報`)
            .setFields(
              { name: `震央`, value: `${msg.Hypocenter}` },
              { name: `深さ`, value: `${msg.Depth}` },
              { name: `マグニチュード`, value: `${msg.Magunitude}` },
              { name: `最大震度`, value: `${msg.MaxIntensity}` }
            )
            .setFooter({
              text: `発生時刻${msg.OriginTime}`,
            }),
        ],
      });
      return;
    } else {
      client.channels.cache.get(ch_id).send({
        embeds: [
          new EmbedBuilder()
            .setTitle(`緊急地震速報(警報) 第${msg.Serial}報`)
            .setFields(
              { name: `震央`, value: `${msg.Hypocenter}` },
              { name: `深さ`, value: `${msg.Depth}` },
              { name: `マグニチュード`, value: `${msg.Magunitude}` },
              { name: `最大震度`, value: `${msg.MaxIntensity}` }
            )
            .setFooter({
              text: `発生時刻${msg.OriginTime}`,
            }),
        ],
      });
      return;
    }
    return;
  }
  if (final === true) {
    client.channels.cache.get(ch_id).send({
      embeds: [
        new EmbedBuilder()
          .setTitle(`緊急地震速報(予報) 最終報`)
          .setFields(
            { name: `震央`, value: `${msg.Hypocenter}` },
            { name: `深さ`, value: `${msg.Depth}` },
            { name: `マグニチュード`, value: `${msg.Magunitude}` },
            { name: `最大震度`, value: `${msg.MaxIntensity}` }
          )
          .setFooter({
            text: `発生時刻${msg.OriginTime}`,
          }),
      ],
    });
    return;
  }
  if (cancel === true) {
    client.channels.cache
      .get(ch_id)
      .send("先程の緊急地震速報は取り消されました");
    return;
  }
  client.channels.cache.get(ch_id).send({
    embeds: [
      new EmbedBuilder()
        .setTitle(`緊急地震速報(予報) 第${msg.Serial}報`)
        .setFields(
          { name: `震央`, value: `${msg.Hypocenter}` },
          { name: `深さ`, value: `${msg.Depth}` },
          { name: `マグニチュード`, value: `${msg.Magunitude}` },
          { name: `最大震度`, value: `${msg.MaxIntensity}` }
        )
        .setFooter({
          text: `発生時刻${msg.OriginTime}`,
        }),
    ],
  });
}

async function quake_info(ch_id, message, client) {
  try {
    const json = JSON.parse(message);
    var depth = "不明";
    var magni = "不明";
    var center = "不明";
    var tsunami = "不明";
    var time = Date.now();
    var cshindo = "不明";
    if (json.earthquake.time !== "") {
      var time = await json.earthquake.time;
    }
    if (json.earthquake.maxScale !== "") {
      var cshindo = await shindo_class(json.earthquake.maxScale);
    }
    if (json.earthquake.depth !== "") {
      var depth = await json.earthquake.hypocenter.depth;
    }
    if (json.earthquake.hypocenter.magnitude !== "") {
      var magni = await json.earthquake.hypocenter.magnitude;
    }
    if (json.earthquake.hypocenter.name !== "") {
      var center = await json.earthquake.hypocenter.name;
    }
    if (json.earthquake.hypocenter.domesticTsunami !== "") {
      var tsunami = await tsunami_class(json.earthquake.domesticTsunami);
    }
    if (magni === -1 && depth === -1) {
      await client.channels.cache.get(ch_id).send({
        embeds: [
          new EmbedBuilder()
            .setTitle("震度速報")
            .setFields(
              { name: "震央", value: center },
              { name: "最大震度", value: cshindo },
              { name: "津波", value: tsunami, inline: true }
            )
            .setFooter({ text: `${time}` }),
        ],
        components: [row],
      });
    } else {
      if (depth == 0) {
        var depth = "ごく浅い";
      }
      if (depth !== "ごく浅い") {
        await client.channels.cache.get(ch_id).send({
          embeds: [
            new EmbedBuilder()
              .setTitle("地震情報")
              .setFields(
                { name: "震央", value: center },
                { name: "深さ", value: `${depth}km`, inline: true },
                { name: "マグニチュード", value: `${magni}`, inline: true },
                { name: "最大震度", value: cshindo },
                { name: "津波", value: tsunami, inline: true }
              )
              .setFooter({ text: `${time}` }),
          ],
          components: [row],
        });
      } else {
        await client.channels.cache.get(ch_id).send({
          embeds: [
            new EmbedBuilder()
              .setTitle("地震情報")
              .setFields(
                { name: "震央", value: center },
                { name: "深さ", value: `${depth}`, inline: true },
                { name: "マグニチュード", value: `${magni}`, inline: true },
                { name: "最大震度", value: cshindo },
                { name: "津波", value: tsunami, inline: true }
              )
              .setFooter({ text: `${time}` }),
          ],
          components: [row],
        });
      }
    }
  } catch (e) {
    console.error(e);
  }
}
