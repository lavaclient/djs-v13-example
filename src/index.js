import "dotenv/config";
import "module-alias/register";
import { Utils, Bot, CommandContext } from "@lib";

const client = new Bot()

client.music.on("connect", () => {
    console.log(`[music] now connected to lavalink`)
});

client.music.on("queueFinish", queue => {
    const embed = Utils.embed("Uh oh, the queue has ended :/");

    queue.channel.send({ embeds: [ embed ] });
    queue.player.disconnect()
    queue.player.node.destroyPlayer(queue.player.guildId);
})

client.music.on("trackStart", (queue, song) => {
    const embed = Utils.embed(`Now playing [**${song.title}**](${song.uri})${song.requester ? ` [<@${song.requester}>]` : ""}`)
    queue.channel.send({ embeds: [embed] });
});

client.on("ready", async () => {
    await Utils.syncCommands(client, __dirname + "/commands", !process.argv.includes("--force-sync"));
    client.music.connect(client.user.id); // Client#user shouldn't be null on ready
    console.log("[discord] ready!");
});

client.on("interactionCreate", interaction => {
    if (interaction.isCommand()) {
        const options = Object.assign({}, ...interaction.options.data.map(i => ({ [i.name]: i.value })));
        client.commands.get(interaction.commandId)?.exec(new CommandContext(interaction), options);
    }
});

client.login(process.env.BOT_TOKEN)
