
const { Client,EmbedBuilder} = require('discord.js');
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
            interaction.reply({ content: "Génération en cours...", ephemeral: true });
            
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

                    const embed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .addFields({ name: prompt, value: response.data.choices[0].text, inline: true })
                        .setTimestamp()
                        .setFooter({ text: 'Texte généré par GPT-3'});                    

                    interaction.editReply({ embeds: [embed] , ephemeral: false});
                })
                .catch((error) => {
                    console.log(error);
                    interaction.editReply({ content: 'Erreur lors de la génération du texte', ephemeral: true });
                }
            );
            

            
        }
};
