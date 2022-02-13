import { Client, IntentsBitField } from "discord.js";
import { APIInvite } from "discord.js/node_modules/discord-api-types";
import dotenv from "dotenv";
import fetch from "node-fetch";
import { activities } from "./activities.js";
import { getStr } from "./constants.js";

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
	if (!intr.isChatInputCommand()) return;

	await intr.deferReply();

	if (!intr.guild) return void intr.editReply({ content: "This command can only be used inside a server." });

	if (!intr.inCachedGuild())
		return void intr.editReply({ content: "Something went wrong with retrieving this server." });

	const { channelId } = intr.member.voice;

	if (!channelId) return void intr.editReply({ content: "You need to be in a voice channel." });

	const activity = activities.find((a) => a.commandName === intr.commandName);

	if (!activity)
		return void intr.editReply({
			content: "Some of my gears broke — I cannot find the activity for this command"
		});

	const url = `https://discord.com/api/v9/channels/${channelId}/invites`;

	const headers = {
		"X-Audit-Log-Reason": `Launched event | Run by ${intr.user.tag} (${intr.user.id})`,
		"Content-Type": "application/json",
		Authorization: `Bot ${BOT_TOKEN}`
	};

	const body = JSON.stringify({
		target_application_id: activity.id,
		target_type: 2
	});

	const invite = (await fetch(url, { method: "POST", headers, body })
		.then((res) => res.json())
		.catch(() => null)) as APIInvite | null;

	if (!invite?.code) return void intr.editReply("Something went wrong with creating the invite.");

	if (invite.code.toString().startsWith("500"))
		return void intr.editReply("Something went wrong. I am likely missing permissions to create this invite.");

	const link = `[Click here to join.](https://discord.com/invite/${invite.code})`;

	intr.editReply(`Successfully made ${getStr(activity.name)} activity!\n${link}`);
});

client.login(BOT_TOKEN);
