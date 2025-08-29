import { Telegraf } from "telegraf";
import * as dotenv from "dotenv";


dotenv.config();
const token = process.env.BOT_TOKEN || "";
const bot = new Telegraf(token);

//histórico de senhas armazenadas - máximo 10
let passwordHistory: string[] = [];

//função para gerar um string
function generateString(length: number) {
    const KeyString ="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-=";
    let RandString = "";
    // O for é para fazer uma seleção aleatória da chave e adicionar ao KeyString
    for (let i = 0; i < length; i++) {
        RandString += KeyString.charAt(
            Math.floor(Math.random() * KeyString.length)
        );
    }

    //Remover caracteres para melhor funcionalidade, impedindo de acidentalmente realizar marcações (markdown) na formação da mensagem
    // O ||, na documentação do telegram, é utilizado para a formatação "spoiler"
    return (
    "||" + RandString.replace(/[~!@#$%^&*()\-=+{}\|;:',.?]/g, "\\$&") + "||"
    );

}



//comando start
bot.start(async (ctx) => {
    ctx.reply(
        "Press /generate to get a newly generated password. You can also send a number to receive a password of that length, i.e: /generate 10."
    );
});

//comando /generate
bot.command("generate", async (ctx) => {
    const parts = ctx.update.message?.text.split(" ") || [];
    let length = 12;
    if (parts.length == 2) {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > 0 ) length = num;
    }
    
    const newPassword = generateString(length);

    if (passwordHistory.length >= 10) {
        passwordHistory.shift(); //remove o mais antigo caso atinja 10 senhas
    }

    passwordHistory.push(newPassword);

    ctx.replyWithMarkdownV2(`Your password is: ${newPassword}`);

});

//comando /list para conseguir ver as 10 ultmas senhas geradas
bot.command("list", async (ctx) => {
    if (passwordHistory.length === 0) {
        return ctx.reply("No password was generated. Use /generate to get started.");
    }

    const list = passwordHistory
    .map((pwd, i) => `${i + 1}\\.` + ` ${pwd}`)
    .join("\n");

    ctx.replyWithMarkdownV2(`Last generated passwords:\n${list}`);
});


//comando /help para usuários aprenderem a usar o bot.
bot.help(async (ctx) =>{
    await ctx.replyWithHTML(
        "Use <b>/generate</b> to create a password.\n" +
        "For example: <code>/generate 15</code> to generate 15 characters."
    );
});




//inicializador do bot
bot.launch();
console.log("Rodando bot...");