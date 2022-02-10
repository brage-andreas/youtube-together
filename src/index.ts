import { Client, IntentsBitField, Invite } from "discord.js";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const { BOT_TOKEN, BOT_ID } = process.env;

if (!BOT_TOKEN || !BOT_ID) throw new Error("BOT_TOKEN and BOT_ID must be defined in your .env file");

const client = new Client<true>({
	intents: [
		IntentsBitField.Flags.GuildVoiceStates, //
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.Guilds
	],
	sweepers: [
		"applicationCommands",
		"bans",
		"emojis",
		"invites",
		"messages",
		"presences",
		"reactions",
		"stageInstances",
		"stickers",
		"threadMembers",
		"threads"
	].reduce((obj, name) => {
		obj[name] = {
			interval: 1800,
			filter: () => () => false
		};
		return obj;
	}, {} as Record<string, object>)
});

client.on("ready", () => {
	const guilds = client.guilds.cache.size;
	const users = client.guilds.cache.reduce((count, guild) => count + guild.memberCount, 0);

	// Clears console
	process.stdout.write("\x1Bc");

	console.log(`Logged on as ${client.user.tag} (${client.user.id})`);
	console.log(`In ${guilds} guilds with ${users} total members`);
});

client.on("interactionCreate", async (intr) => {
	if (!intr.isChatInputCommand() || intr.commandName !== "youtube") return;

	if (!intr.guild) return intr.reply({ content: "This command can only be used inside a server.", ephemeral: true });

	if (!intr.inCachedGuild())
		return intr.reply({ content: "Something went wrong with retrieving this server.", ephemeral: true });

	const { channelId } = intr.member.voice;

	if (!channelId) return intr.reply({ content: "You need to be in a voice channel.", ephemeral: true });

	await intr.deferReply();

	const url = `https://discord.com/api/v9/channels/${channelId}/invites`;

	const headers = {
		"Content-Type": "application/json",
		Authorization: `Bot ${BOT_TOKEN}`
	};

	const body = JSON.stringify({
		target_application_id: "880218394199220334",
		target_type: 2
	});

	const invite = (await fetch(url, { method: "POST", headers, body })
		.then((res) => res.json())
		.catch(() => null)) as Invite | null;

	if (!invite?.code) return void intr.editReply("Something went wrong with creating the invite.");

	if (invite.code === "50013") return void intr.editReply("I am missing permissions to create invites.");

	intr.editReply(
		`Successfully made a Watch Together activity!\n[Click here to join.](https://discord.com/invite/${invite.code})`
	);
});

client.login(BOT_TOKEN);
