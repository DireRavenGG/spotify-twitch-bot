var axios = require("axios");
var tmi = require("tmi.js");
require("dotenv").config();
const opts = {
  identity: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
  },
  channels: ["DireRavenGG", "RallyRobbie"],
};

const client = new tmi.client(opts);

client.on("message", onMessageHandler);
client.on("connected", onConnectedHandler);


client.connect();
var blame = 0;

function onMessageHandler(target, context, msg, self) {
  if (self) {
    return;
  } 

  const commandName = msg.trim();

  // toggle bot on and offline:
  // BOT_ONLINE -> toggle true/false

  // if BOT_ONLINE == TRUE:
  //      if command == "!music":
  //
  //          hit the /playback endpoint and get response.
  //          if response === 500:
  //                twitchapi.sendMessage("spotify api not ready yet!")
  //                return
  //          get the song_url
  //          twitchapi.sendMessage(`hey, we're listening to ${song_urL}`)

  // If the command is known, let's execute it

  switch (commandName) {
    case "!dice":
      const num = rollDice();
      client.say(target, `You rolled a ${num}`);
      console.log(`* Executed ${commandName} command`);
      break;
    case "!blamegame": {
      blame += 1;
      if (target === "#direravengg") {
        client.say(
          target,
          `DireRavenGG has blamed his teamates ${blame} times this game!`
        );
      } else {
        client.say(
          target,
          `Bert Skurt has blamed his teamates ${blame} times this game!`
        );
      }
      break;
    }
    case "!clearblame": {
      blame = 0;
      client.say(target, `@${context["display-name"]} cleared blamegame.`);

      break;
    }
    case "!opgg": {
      if (target === "#direravengg") {
        client.say(target, "https://na.op.gg/summoner/userName=QueenRaka");
      } else {
        client.say(target, "https://na.op.gg/summoner/userName=bertskurt");
      }
      break;
    }
    case "!song": {
      axios.get("http://localhost:3001/playback", {}).then(async (res) => {
        await client.say(
          target,
          `${res.data.currentTrack} by ${res.data.currentArtist}. Link: ${res.data.songUrl}`
        );
      });

      break;
    }
  }
}

// Function called when the "dice" command is issued
function rollDice() {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler(addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}

export {};
