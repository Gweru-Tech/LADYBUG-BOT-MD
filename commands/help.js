const settings = require('../settings');
const fs = require('fs');
const path = require('path');

async function helpCommand(sock, chatId, message) {
    // Determine the current time to select the appropriate greeting
    const currentHour = new Date().getHours();
    let greeting;

    if (currentHour < 11) {
        greeting = "𝚂𝚎𝚕𝚊𝚖𝚊𝚝 𝙿𝚊𝚐𝚒"; // Good Morning
    } else if (currentHour < 15) {
        greeting = "𝚂𝚎𝚕𝚊𝚖𝚊𝚝 𝚂𝚒𝚊𝚗𝚐"; // Good Day
    } else if (currentHour < 18) {
        greeting = "𝚂𝚎𝚕𝚊𝚖𝚊𝚝 𝚂𝚘𝚛𝚎"; // Good Afternoon
    } else {
        greeting = "𝚂𝚎𝚕𝚊𝚖𝚊𝚝 𝙼𝚊𝚕𝚊𝚖"; // Good Evening
    }

    const helpMessage = `
━━━━━━━━━━━━━━━━━┈⊷
|✦ ${settings.botName || 'ＬＡＤＹＢＵＧ-ＭＤ'}*  
|✦ Version: *${settings.version || '3.0.0'}*
|✦ by ${settings.botOwner || 'ᴹʳ ᴺᵗᵃⁿᵈᵒ ᴼᶠᶜ'}
|✦ YouTube : ${global.ytch}
|✦ ${greeting}!
━━━━━━━━━━━━━━━━━┈⊷ 
╭━━〔 📌 𝙲𝙾𝚁𝙴 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂 〕━━┈⊷
│  ✪ .𝔪𝔢𝔫𝔲 /𝔥𝔢𝔩𝔭
│  ✪ .𝔭𝔦𝔫𝔤
│  ✪ .𝔞𝔩𝔦𝔳𝔢
│  ✪ .𝔬𝔴𝔫𝔢𝔯
│  ✪ .𝔧𝔦𝔡
│  ✪ .𝔲𝔯𝔩
│  ✪ .𝔱𝔱𝔰
│  ✪ .𝔧𝔬𝔨𝔢
│  ✪ .𝔮𝔲𝔬𝔱𝔢 
│  ✪ .𝔣𝔞𝔠𝔱
│  ✪ .𝔫𝔢𝔴𝔰
│  ✪ .𝔴𝔢𝔞𝔱𝔥𝔢𝔯 <𝔠𝔦𝔱𝔶>
│  ✪ .𝔩𝔶𝔯𝔦𝔠𝔰 <𝔰𝔬𝔫𝔤>
│  ✪ .8𝔟𝔞𝔩𝔩 <𝔮>
│  ✪ .𝔤𝔯𝔬𝔲𝔭𝔦𝔫𝔣𝔬
│  ✪ .𝔞𝔡𝔪𝔦𝔫𝔰 / 𝔰𝔱𝔞𝔣𝔣
│  ✪ .𝔳𝔳
│  ✪ .𝔱𝔯𝔱 <𝔱𝔢𝔵𝔱> <𝔩𝔞𝔫𝔤>
│  ✪ .𝔰𝔰 <𝔩𝔦𝔫𝔨>
│  ✪ .𝔞𝔱𝔱𝔭 <𝔱𝔢𝔵𝔱>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🛡️ 𝙶𝚁𝙾𝚄𝙿 𝙰𝙳𝙼𝙸𝙽𝙸𝚂𝚃𝚁𝙰𝚃𝙸𝙾𝙽 〕━━┈⊷
│  ✪ .𝔟𝔞𝔫
│  ✪ .kick
│  ✪ .mute / .unmute
│  ✪ .promote / .demote
│  ✪ .del
│  ✪ .warn
│  ✪ .warnings
│  ✪ .clear
│  ✪ .tag
│  ✪ .tagall
│  ✪ .tagnotadmin
│  ✪ .hidetag
│  ✪ .antilink
│  ✪ .antibadword
│  ✪ .antitag
│  ✪ .chatbot
│  ✪ .welcome
│  ✪ .goodbye
│  ✪ .resetlink
│  ✪ .setgname <name>
│  ✪ .setgdesc <desc>
│  ✪ .setgpp
│  ✪ .accept all
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 👑 OWNER CONTROL PANEL 〕━━┈⊷
│  ✪ .mode <public/self>
│  ✪ .update
│  ✪ .settings
│  ✪ .clearsession
│  ✪ .cleartmp
│  ✪ .antidelete
│  ✪ .anticall
│  ✪ .setpp <reply image>
│  ✪ .setmention <reply msg>
│  ✪ .mention
│  ✪ .autoread
│  ✪ .autoreact
│  ✪ .autotyping
│  ✪ .autostatus
│  ✪ .autostatus react
│  ✪ .pmblocker
│  ✪ .pmblocker setmsg
│  ✪ .savestatus 
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🖼️ MEDIA & STICKERS 〕━━┈⊷
│  ✪ .sticker
│  ✪ .tgsticker
│  ✪ .simage <reply sticker>
│  ✪ .blur <reply image>
│  ✪ .crop
│  ✪ .removebg
│  ✪ .meme
│  ✪ .take
│  ✪ .emojimix
│  ✪ .igs <insta link>
│  ✪ .igsc <insta link>
│  ✪ .hd <reply image>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🌍 IMAGE SEARCH (PIES) 〕━━┈⊷
│  ✪ .pies <country>
│  ✪ .japan
│  ✪ .korean
│  ✪ .indonesia
│  ✪ .china
│  ✪ .hijab
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎮 GAMES & ENTERTAINMENT 〕━━┈⊷
│  ✪ .tictactoe @user
│  ✪ .hangman
│  ✪ .guess <letter>
│  ✪ .trivia
│  ✪ .answer <answer>
│  ✪ .truth
│  ✪ .dare
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🤖 AI INTELLIGENCE HUB 〕━━┈⊷
│  ✪ .gpt <question>
│  ✪ .gemini <question>
│  ✪ .imagine <prompt>
│  ✪ .flux <prompt>
│  ✪ .sora <prompt>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 💻 SOURCE & REPOSITORY 〕━━┈⊷
│  ✪ .git
│  ✪ .github
│  ✪ .repo
│  ✪ .sc
│  ✪ .script
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎭 REACTIONS & EMOTES 〕━━┈⊷
│  ✪ .nom
│  ✪ .poke
│  ✪ .cry
│  ✪ .kiss
│  ✪ .pat
│  ✪ .hug
│  ✪ .wink
│  ✪ .facepalm
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🎨 EFFECTS & GENERATORS 〕━━┈⊷
│  ✪ .heart
│  ✪ .horny
│  ✪ .lgbt
│  ✪ .circle
│  ✪ .lolice
│  ✪ .its-so-stupid
│  ✪ .namecard
│  ✪ .oogway
│  ✪ .tweet
│  ✪ .ytcomment
│  ✪ .comrade
│  ✪ .gay
│  ✪ .glass
│  ✪ .jail
│  ✪ .passed
│  ✪ .triggered
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 😄 FUN & SOCIAL 〕━━┈⊷
│  ✪ .compliment @user
│  ✪ .insult @user
│  ✪ .flirt
│  ✪ .shayari
│  ✪ .goodnight
│  ✪ .roseday
│  ✪ .character @user
│  ✪ .wasted @user
│  ✪ .ship @user
│  ✪ .simp @user
│  ✪ .stupid @user <text>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 ✍️ TEXT DESIGNER 〕━━┈⊷
│  ✪ .metalic
│  ✪ .ice
│  ✪ .snow
│  ✪ .impressive
│  ✪ .matrix
│  ✪ .light
│  ✪ .neon
│  ✪ .devil
│  ✪ .purple
│  ✪ .thunder
│  ✪ .hacker
│  ✪ .sand
│  ✪ .leaves
│  ✪ .1917
│  ✪ .arena
│  ✪ .blackpink
│  ✪ .glitch
│  ✪ .fire
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 ⬇️ MEDIA DOWNLOADS 〕━━┈⊷
│  ✪ .song <name>
│  ✪ .play <name>
│  ✪ .spotify <name>
│  ✪ .video <name>
│  ✪ .instagram <link>
│  ✪ .facebook <link>
│  ✪ .tiktok <link>
╰━━━━━━━━━━━━━━━━━┈⊷

╭━━〔 🔔 SYSTEM UPDATES 〕━━┈⊷
│  ✪ Join Official Channel 👇👇
╰━━━━━━━━━━━━━━━━━┈⊷`;

    try {
        const imagePath = path.join(__dirname, '../assets/bot_image.jpg');
        
        if (fs.existsSync(imagePath)) {
            const imageBuffer = fs.readFileSync(imagePath);
            
            await sock.sendMessage(chatId, {
                image: imageBuffer,
                caption: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: 'https://whatsapp.com/channel/0029VbBjU8G4Y9lfinrbqS1U',
                        newsletterName: 'LADYBUG-MD',
                        serverMessageId: -1
                    }
                }
            }, { quoted: message });
        } else {
            console.error('Bot image not found at:', imagePath);
            await sock.sendMessage(chatId, { 
                text: helpMessage,
                contextInfo: {
                    forwardingScore: 1,
                    isForwarded: true,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: 'https://whatsapp.com/channel/0029VbBjU8G4Y9lfinrbqS1U',
                        newsletterName: 'Mr Ntando by CODEBREAKER',
                        serverMessageId: -1
                    } 
                }
            });
        }
    } catch (error) {
        console.error('Error in help command:', error);
        await sock.sendMessage(chatId, { text: helpMessage });
    }
}

module.exports = helpCommand;
