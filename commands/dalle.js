
const { ModalBuilder, TextInputBuilder,TextInputStyle, ActionRowBuilder, EmbedBuilder,Events} = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');
const dotenv = require('dotenv');
dotenv.config();
const sqlite3 = require('sqlite3').verbose();


module.exports = {
	data: new SlashCommandBuilder()
		.setName('dalle')
		.setDescription('Demande à dalle de générer une image à partir d\'un texte')
        .addStringOption(option => option.setName('texte').setDescription('Texte à générer').setRequired(true)),
		

        async execute(client,interaction) {
            const prompt = interaction.options.getString('texte');

            let token = "";
            let user = await this.checkUser(interaction.user.id);

            if(user){
                token = user.token;
                await interaction.reply({ content: "Génération en cours..."});

            } else {
                let res = await this.getToken(client,interaction)
                token = res[0];
                interaction = res[1];
            }
            console.log(token);

            const axios = require('axios');
            const data = {
                "prompt": prompt,
                "n" : 4,
                "size": "1024x1024",
            };
            const config = {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            };
            axios.post('https://api.openai.com/v1/images/generations', data, config)
                .then((response) => {
                    let embeds = [];
                    for(let i = 0; i < response.data.data.length; i++){
                        const embed = new EmbedBuilder()
                            .setTitle(prompt)
                            .setColor(0x0099FF)
                            .setURL("https://labs.openai.com/")
                            .setImage(response.data.data[i].url)
                            .setTimestamp()
                            .setFooter({ text: 'Image générée par dalle'});
                        embeds.push(embed);
                    }

                    interaction.editReply({ content:"",embeds: embeds });
                })
                .catch((error) => {
                        console.log(error.message);
                        interaction.editReply({ content: "Erreur lors de la génération de l'image", ephemeral: true });
                    }
                );


        },
        async checkUser(user){
            return new Promise((resolve, reject) => {
                let sql = `SELECT token FROM users WHERE idUser = ${user}`;
                new sqlite3.Database('./user.db').get(sql, [], (err, row) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(row);
                });
            });
        },
        async addUser(user,token){
            return new Promise((resolve, reject) => {
                let sql = `INSERT INTO users(idUser,token) VALUES(${user},"${token}")`;
                new sqlite3.Database('./user.db').run(sql, [], (err) => {
                    if (err) {
                        reject(err);
                    }
                    resolve();
                });
            });
        },
        async getToken(client,interaction){
            return new Promise(async (resolve, reject) => {
                const tokenTextInput = new TextInputBuilder()
                    .setCustomId('tokenInput')
                    .setLabel("Quelle est votre token openai ?")
                    .setPlaceholder("Votre token openai")
                    .setRequired(true)
                    .setStyle(TextInputStyle.Short);

                const modal = new ModalBuilder()
                    .setCustomId('myModal')
                    .setTitle('Enregistrement de votre token openai')
                    .addComponents(new ActionRowBuilder().addComponents(tokenTextInput));
                client.on(Events.InteractionCreate, async modalInteraction => {
                    if (!modalInteraction.isModalSubmit()) return;
                    let token = modalInteraction.fields.getTextInputValue('tokenInput');
                    await this.addUser(interaction.user.id,token);
                    await modalInteraction.reply({ content: "Génération en cours..."});
                    resolve([token,modalInteraction]);
                });
                await interaction.showModal(modal);
            });
        }


};
