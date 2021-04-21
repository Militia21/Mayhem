const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("I am alive!"));

app.listen((port) => console.log("Listening to webserver"));

const { Client, Intents, Collection } = require("discord.js");
const { Database } = require("zapmongo");
const { promisify } = require("util");
const glob = require("glob");
const fs = require("fs");
const config = require("../config.json");

const globPromise = promisify(glob);

const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  ws: {
    intents: Intents.ALL,
  },
  disableMentions: "everyone",
  restRequestTimeout: 20000,
});

client.commands = new Collection();
client.events = new Collection();
client.cooldowns = new Collection();
client.aliases = new Collection();
client.categories = new Set();
client.hex = "#eb5a45";
client.owners = ["742972160158728283"];
client.antijoins = new Collection();
client.db = new Database({
  mongoURI: process.env.mongoURI,
  schemas: [
    {
      name: "guildconfig",
      data: {
        Guild: String,
        Prefix: String,
      },
    },
    {
      name: "bio",
      data: {
        User: String,
        Bio: String,
      },
    },
    {
      name: "modmail",
      data: {
        Guild: String,
        Category: String,
        Choices: Object,
        Role: String,
      },
    },
    {
      name: "blacklist",
      data: {
        UserID: String,
      },
    },
    {
      name: "TicketData",
      data: {
        MessageID: String,
        GuildID: String,
        TicketNumber: Number,
        WhitelistedRole: String,
        CategoryID: String,
      },
    },
    {
      name: "ReactionRole",
      data: {
        Guild: String,
        MessageID: String,
        Reaction: String,
        Role: String,
      },
    },
  ],
});

(async () => {
  const eventFiles = await globPromise(`${__dirname}/src/events/**/*.js`);
  const commandFiles = await globPromise(`${__dirname}/src/commands/**/*.js`);

  eventFiles.map((value) => {
    const file = require(value);
    client.events.set(file.name, file);
    client.on(file.name, file.run.bind(null, client));
  });
  commandFiles.map((value) => {
    const file = require(value);
    client.commands.set(file.name, file);
    client.categories.add(file.category);

    if (file.aliases) {
      file.aliases.map((value) => client.aliases.set(value, file.name));
    }
  });
})();

client.login(process.env.TOKEN);
