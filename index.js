
const fs = require('fs');
const { Client, Collection } = require('discord.js');
const dotenv = require('dotenv');
dotenv.config();

const token = process.env.TOKEN;

const client = new Client({ intents: 8});

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));

client.commands = new Collection();

// Load all events
for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) 
		client.once(event.name, (...args) => event.execute(...args));
	else 
		client.on(event.name, (...args) => event.execute(client,...args));
	
}

// load all commands
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}


client.login(token);

