import dotenv from "dotenv";
import fetch from "node-fetch";
dotenv.config();
const { BOT_TOKEN, BOT_ID } = process.env;
if (!BOT_TOKEN || !BOT_ID)
    throw new Error("BOT_TOKEN and BOT_ID must be defined in your .env file");
const url = `https://discord.com/api/v9/applications/${BOT_ID}/commands`;
const headers = {
    "Content-Type": "application/json",
    Authorization: `Bot ${BOT_TOKEN}`
};
const body = JSON.stringify({
    description: "Launch a YouTube Watch Together activity in your voice channel",
    name: "youtube",
    type: 1
});
const res = await fetch(url, { method: "POST", headers, body });
console.log("Built commands:");
console.log(`  ....OK: ${res.ok}`);
console.log(`  Status: ${res.status}`);
console.log(`  ..Text: ${res.statusText}`);
console.log(`  ..Type: ${res.type}`);
