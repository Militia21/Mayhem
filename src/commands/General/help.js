const ms = require("ms");
const { MessageEmbed } = require("discord.js");

module.exports = {
  name: "help",
  aliases: ["h", "cmds", "commands"],
  category: "general",
  cooldown: 2000,
  run: async (client, message, args) => {
    if (!args.length) {
      const embed = new MessageEmbed();
      embed.setColor(client.hex);
      embed.setDescription(`
     ${[...client.categories]
       .map(
         (value) =>
           `**${value[0].toUpperCase() + value.slice(1).toLowerCase()} [${
             client.commands.filter(
               (cmd) => cmd.category == value.toLowerCase()
             ).size
           }]**\n${client.commands
             .filter((cmd) => cmd.category == value.toLowerCase())
             .map((value) => value.name)
             .join(", ")}`
       )
       .join("\n\n")}
     `);
      message.channel.send(embed);
    } else {
      const cmd =
        client.commands.get(args[0].toLowerCase()) ||
        client.commands.get(client.aliases.get(args[0].toLowerCase()));
      if (!cmd) return message.channel.send("Couldn't find that command!");

      const embed = new MessageEmbed();
      embed.setTitle(
        `${cmd.name[0].toUpperCase() + cmd.name.slice(1).toLowerCase()}`
      );
      embed.setColor(client.hex);
      const properties = Object.entries(cmd);

      embed.setDescription(
        properties
          .filter((value) => typeof value[1] != "function")
          .map((value) => {
            const key =
              value[0][0].toUpperCase() + value[0].slice(1).toLowerCase();
            if (typeof value[1] == "string") {
              return `\`${key}\`: ${value[1]}`;
            } else if (typeof value[1] == "number") {
              return `\`${key}\`: ${ms(value[1], { long: true })}`;
            } else if (typeof value[1].map == "function") {
              return `\`${key}\`: ${value[1]}`;
            } else {
              return `\`${key}\`: ${value[1]}`;
            }
          })
      );
      return message.channel.send(embed);
    }
  },
};
