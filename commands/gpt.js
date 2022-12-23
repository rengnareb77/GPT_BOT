
const { Client, Intents} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const dotenv = require('dotenv');
const apikey = process.env.OPENAI_KEY;

dotenv.config();


module.exports = {
	data: new SlashCommandBuilder()
		.setName('gpt')
		.setDescription('Demande à GPT-3 de générer un texte')
        .addStringOption(option => option.setName('texte').setDescription('Texte à générer').setRequired(true)),
		

        async execute(client,interaction) {
            const prompt = interaction.options.getString('texte');
            
            const axios = require('axios');
            const data = {
                "model": "text-davinci-001",
                "prompt": prompt,
                "max_tokens": 256
            };
            const config = {
                headers: {
                    "Authorization": `Bearer ${apikey}`
                }
            };
            axios.post('https://api.openai.com/v1/completions', data, config)
                .then((response) => {
                    interaction.reply(response.data.choices[0].text);
                }
            );
            

            
        }
};
