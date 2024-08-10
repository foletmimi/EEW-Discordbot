const WebSocket = require("ws");
const Discord = require("discord.js");
const { token } = require(`${process.cwd()}/config.json`);
const fs = require("fs");
const path = require("node:path");
const weve = require("./events_webs/event.js"); //別で処理を書き、わかりやすくする。
//イベントハンドリング
const Client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
  ],
});
const dis_eventsPath = path.join(__dirname, "events_dis");
const dis_eventFiles = fs
  .readdirSync(dis_eventsPath)
  .filter((file) => file.endsWith(".js"));

for (const dis_file of dis_eventFiles) {
  const filePath = path.join(dis_eventsPath, dis_file);
  const event = require(filePath);
  if (event.once) {
    Client.once(event.name, (...args) => event.execute(...args));
  } else {
    Client.on(event.name, (...args) => event.execute(...args));
  }
}

//コマンド読み込み
Client.commands = new Discord.Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs
  .readdirSync(foldersPath)
  .filter((file) => file.endsWith(".js"));

for (const folder of commandFolders) {
  const filePath = path.join(foldersPath, folder);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    Client.commands.set(command.data.name, command);
  } else {
    console.log(
      `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
    );
  }
}

Client.login(token);
//インターバル時間の設定
const messageInterval = 36000000;
const pingInterval2 = 36000000;

//websocket接続
ws_connect1();
ws_connect2();

//接続処理部分、中身は同じもの、数字が違うだけ。
function ws_connect1() {
  let lastMessageTime = Date.now();
  let pingTimer;
  const webs = new WebSocket("wss://ws-api.wolfx.jp/jma_eew");

  webs.on("open", (open) => {
    console.log("wolf:WebSocket接続成功");
    pingTimer = setInterval(() => {
      const now = Date.now();
      const elapsedTime = now - lastMessageTime;
      // 一定時間メッセージを受け取らなかった場合
      if (elapsedTime >= messageInterval) {
        console.log("wolf:メッセージ受信間隔が一定時間を超えました");
        console.log("ping送信");
        webs.ping();
      }
    }, pingInterval2);
  });

  webs.on("error", async (er) => {
    console.log(`wolf error-message:${er}`);
    var waitTime = await randomWait(0, 100000);
    console.log(`wolf:ランダム待機: ${waitTime}ms`);

    clearInterval(pingTimer);
    ws_connect1();
  });

  webs.on("close", async (close) => {
    weve.onClose(close);
    var waitTime = await randomWait(0, 100000);
    console.log(`wolf:ランダム待機: ${waitTime}ms`);

    clearInterval(pingTimer);
    ws_connect1();
  });

  webs.on("message", (msg) => {
    weve.onWMessage(msg, Client);
    lastMessageTime = Date.now();
  });
}

function ws_connect2() {
  let lastMessageTime = Date.now();
  let pingTimer;
  const webs = new WebSocket("wss://api.p2pquake.net/v2/ws");

  webs.on("open", (open) => {
    console.log("p2p:WebSocket接続成功");
    pingTimer = setInterval(() => {
      const now = Date.now();
      const elapsedTime = now - lastMessageTime;
      // 一定時間メッセージを受け取らなかった場合
      if (elapsedTime >= messageInterval) {
        console.log("p2p:メッセージ受信間隔が一定時間を超えました");
        console.log("ping送信");
        webs.ping();
      }
    });
  });

  webs.on("error", async (er) => {
    console.log(`p2p error-message:${er}`);
    var waitTime = await randomWait(0, 100000);
    console.log(`p2p:ランダム待機: ${waitTime}ms`);

    clearInterval(pingTimer);
    ws_connect1();
  });

  webs.on("close", async (close) => {
    weve.onClose(close);
    var waitTime = await randomWait(0, 100000);
    console.log(`p2p:ランダム待機: ${waitTime}ms`);

    clearInterval(pingTimer);
    ws_connect2();
  });

  webs.on("message", (msg) => {
    weve.onPMessage(msg, Client);
    lastMessageTime = Date.now();
  });
}

function randomWait(min, max) {
  return new Promise((resolve) => {
    const waitTime = Math.random() * (max - min) + min;
    setTimeout(resolve, waitTime);
    return waitTime;
  });
}
