const { SlashCommandBuilder } = require('@discordjs/builders');
const log4js = require('log4js');
const logger = log4js.getLogger('log');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('내전_신청자_리스트')
		.addStringOption((option) =>
			option
				.setName('게임')
				.setDescription('각 신청자의 랭크/티어를 보고싶으시면 해당 게임을 골라주세요.')
				.setRequired(false)
				.addChoice('롤', '리그 오브 레전드')
				.addChoice('발로', '발로란트'),
		)
		.setDescription('내전 리스트를 신청한 순서대로 봅니다. 다른 신청자들의 랭크와 티어를 보고싶으면, 해당 옵션을 선택해주세요.',
		),

	async execute(interaction) {
		async function main() {
			const serverid = interaction.guildId;
			const gameselected = interaction.options.getString('게임');
			const { pool } = require('../index.js');



			let msg = 'There is no one in the list yet!';
			let userid;


			const promisePool = pool.promise();
			const sql = `SELECT * FROM inhouse_list JOIN player_info ON inhouse_list.userid = player_info.userid WHERE inhouse_list.server = ${serverid} ORDER BY inhouse_list.number ASC`;
		
			const [rows, fields] = await promisePool.query(sql);
			console.log(rows);
			for (let i = 0; i < rows.length; i++) {
				if (i === 0) {
					msg = '';

				}
	
				userid = rows[i]['userid'];
				userid = userid.toString();
				try {
					const member = await interaction.guild.members.fetch({
						user: userid,
						force: false,
					});
					msg += `${i + 1} : ${member.displayName} (${member.user.tag})`;
					if (gameselected === '리그 오브 레전드') {
						msg += `\`\`\[${rows[i]['league_tier']} ${rows[i]['league_rank']} ${rows[i]['position']}\]\`\`\n`;
					}
					else if (gameselected === '발로란트') {
						msg += `\`\`\[${rows[i]['valorant_tier']} ${rows[i]['valorant_rank']}\]\`\`\n`;
					}
					else {
						msg += '\n';
					}
				}
				catch (err) {
					logger.error(err);
					msg += `${i + 1}: Unknown User (No longer in the server)\n`;
				}
			}
			return msg;
		}
		const msg  = await main();
		await interaction.reply({ content: msg , ephemeral: true });

		logger.info(
			interaction.user.tag + ' generated the list for ' + interaction.guild.name + '.',
		);

	},
};
