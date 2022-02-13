import dotenv from "dotenv";
import fetch from "node-fetch";
import { activities } from "./activities.js";
import { getStr } from "./constants.js";

dotenv.config();

const { BOT_TOKEN, BOT_ID } = process.env;

if (!BOT_TOKEN || !BOT_ID) throw new Error("BOT_TOKEN and BOT_ID must be defined in your .env file");

const url = `https://discord.com/api/v9/applications/${BOT_ID}/commands`;

const headers = {
	"Content-Type": "application/json",
	Authorization: `Bot ${BOT_TOKEN}`
};

const body = JSON.stringify(
	activities.map((activity) => ({
		description: `Launch ${getStr(activity.name)} activity in your voice channel`,
		name: activity.commandName,
		type: 1
	}))
);

const res = await fetch(url, { method: "PUT", headers, body });

console.log("Built commands:");
console.log(`  ....OK: ${res.ok}`);
console.log(`  Status: ${res.status} ${res.statusText}`);
