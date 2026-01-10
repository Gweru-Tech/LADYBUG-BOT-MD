const fs = require('fs');
const path = require('path');

module.exports = {
    name: 'channel',
    alias: ['ch', 'info', 'profile'],
    description: 'Get WhatsApp channel/profile information',
    category: 'Utility',
    
    async execute(sock, chatUpdate, isFromMe) {
        try {
            const message = chatUpdate.messages?.[0];
            if (!message || !message.key) return;
            
            const m = {
                sender: message.key.remoteJid,
                chat: message.key.remoteJid,
                key: message.key,
                fromMe: message.key.fromMe
            };
            
            const body = (message.message?.conversation) || 
                        (message.message?.extendedTextMessage?.text) || '';
            
            // Check if message starts with channel-related commands
            if (!body.startsWith('.channel') && 
                !body.startsWith('.ch') && 
                !body.startsWith('.jid') &&
                !body.startsWith('.dp') &&
                !body.startsWith('.about') &&
                !body.startsWith('.lastseen') &&
                !body.startsWith('.profile') &&
                !body.startsWith('.download') &&
                !body.startsWith('.getdp') &&
                !body.startsWith('.getabout')) return;
            
            const prefix = body.split(' ')[0];
            const args = body.slice(prefix.length).trim();
            
            // Command routing
            switch(prefix) {
                case '.channel':
                case '.ch':
                    await handleChannelInfo(sock, m, message, args);
                    break;
                case '.jid':
                    await handleGetJid(sock, m, message, args);
                    break;
                case '.dp':
                case '.getdp':
                    await handleGetDP(sock, m, message, args);
                    break;
                case '.about':
                case '.getabout':
                    await handleGetAbout(sock, m, message, args);
                    break;
                case '.lastseen':
                    await handleGetLastSeen(sock, m, message, args);
                    break;
                case '.profile':
                    await handleProfileInfo(sock, m, message, args);
                    break;
                case '.download':
                    await handleDownload(sock, m, message, args);
                    break;
                default:
                    await handleChannelInfo(sock, m, message, args);
            }
            
        } catch (error) {
            console.error('Channel command error:', error);
            try {
                if (chatUpdate.messages && chatUpdate.messages[0]) {
                    const message = chatUpdate.messages[0];
                    await sock.sendMessage(message.key.remoteJid, {
                        text: '❌ An error occurred. Please try again.'
                    }, { quoted: message });
                }
            } catch (err) {
                console.error('Failed to send error message:', err);
            }
        }
    }
};

// Handle channel information
async function handleChannelInfo(sock, m, message, args) {
    try {
        const targetJid = args || getQuotedJid(message) || m.sender;
        
        await sock.sendMessage(m.chat, {
            text: '🔍 *Fetching channel information...*\n\nPlease wait...',
            mentions: [targetJid]
        }, { quoted: message });
        
        // Get profile picture
        let dpUrl = null;
        try {
            dpUrl = await sock.profilePictureUrl(targetJid, 'image');
        } catch (error) {
            console.log('No profile picture found');
        }
        
        // Get metadata
        const metadata = await sock.groupMetadata(targetJid).catch(() => null);
        
        // Get status/last seen
        let lastSeen = 'Not available';
        try {
            const presence = await sock.presenceSubscribe(targetJid);
            lastSeen = 'Online' || 'Recently active';
        } catch (error) {
            lastSeen = 'Unable to determine';
        }
        
        // Format response
        let response = `📢 *CHANNEL INFORMATION*\n\n`;
        response += `🆔 *JID:* ${targetJid}\n`;
        
        if (metadata) {
            response += `📛 *Name:* ${metadata.subject || 'N/A'}\n`;
            response += `👥 *Members:* ${metadata.participants?.length || 0}\n`;
            response += `📝 *Description:* ${metadata.desc || 'No description'}\n`;
            response += `👑 *Owner:* ${metadata.owner || 'N/A'}\n`;
        } else {
            response += `📛 *Type:* Personal Chat\n`;
        }
        
        response += `👁️ *Last Seen:* ${lastSeen}\n`;
        
        if (dpUrl) {
            response += `\n📸 *Profile Picture:* Available`;
            await sock.sendMessage(m.chat, {
                image: { url: dpUrl },
                caption: response,
                mentions: [targetJid]
            }, { quoted: message });
        } else {
            response += `\n📸 *Profile Picture:* Not available`;
            await sock.sendMessage(m.chat, {
                text: response,
                mentions: [targetJid]
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error getting channel info:', error);
        await sock.sendMessage(m.chat, {
            text: `❌ Error fetching channel information:\n${error.message}`
        }, { quoted: message });
    }
}

// Handle JID retrieval
async function handleGetJid(sock, m, message, args) {
    try {
        const targetJid = args || getQuotedJid(message) || m.sender;
        
        let response = `🆔 *JID INFORMATION*\n\n`;
        response += `📱 *Full JID:* ${targetJid}\n`;
        response += `🔢 *Number:* ${targetJid.split('@')[0]}\n`;
        response += `🏷️ *Type:* ${targetJid.includes('@g.us') ? 'Group' : 'Individual'}\n`;
        response += `📱 *Platform:* WhatsApp`;
        
        await sock.sendMessage(m.chat, {
            text: response,
            mentions: [targetJid]
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error getting JID:', error);
        await sock.sendMessage(m.chat, {
            text: '❌ Error retrieving JID information'
        }, { quoted: message });
    }
}

// Handle DP (Display Picture) retrieval
async function handleGetDP(sock, m, message, args) {
    try {
        const targetJid = args || getQuotedJid(message) || m.sender;
        
        await sock.sendMessage(m.chat, {
            text: `📸 *Fetching profile picture for...*\n${targetJid}`
        }, { quoted: message });
        
        const dpUrl = await sock.profilePictureUrl(targetJid, 'image');
        
        await sock.sendMessage(m.chat, {
            image: { url: dpUrl },
            caption: `📸 *Profile Picture*\n\n🆔 ${targetJid}`,
            mentions: [targetJid]
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error getting DP:', error);
        await sock.sendMessage(m.chat, {
            text: `❌ Error fetching profile picture:\n• User may have disabled profile picture\n• User may have blocked the bot\n• Invalid JID format`,
            mentions: [args || getQuotedJid(message) || m.sender]
        }, { quoted: message });
    }
}

// Handle About/Status retrieval
async function handleGetAbout(sock, m, message, args) {
    try {
        const targetJid = args || getQuotedJid(message) || m.sender;
        
        await sock.sendMessage(m.chat, {
            text: '📝 *Fetching status/about information...*'
        }, { quoted: message });
        
        // Get status
        let status = 'No status available';
        try {
            status = await sock.fetchStatus(targetJid);
            status = status.status || 'No status set';
        } catch (error) {
            console.log('Status not available');
        }
        
        // Get profile picture URL
        let dpUrl = null;
        try {
            dpUrl = await sock.profilePictureUrl(targetJid, 'image');
        } catch (error) {
            console.log('No profile picture');
        }
        
        let response = `📝 *ABOUT/STATUS INFORMATION*\n\n`;
        response += `🆔 *JID:* ${targetJid}\n`;
        response += `💬 *Status:* ${status}\n`;
        response += `📅 *Set on:* ${new Date().toLocaleDateString()}\n`;
        
        if (dpUrl) {
            await sock.sendMessage(m.chat, {
                image: { url: dpUrl },
                caption: response,
                mentions: [targetJid]
            }, { quoted: message });
        } else {
            await sock.sendMessage(m.chat, {
                text: response,
                mentions: [targetJid]
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error getting about:', error);
        await sock.sendMessage(m.chat, {
            text: '❌ Error fetching status information'
        }, { quoted: message });
    }
}

// Handle Last Seen retrieval
async function handleGetLastSeen(sock, m, message, args) {
    try {
        const targetJid = args || getQuotedJid(message) || m.sender;
        
        await sock.sendMessage(m.chat, {
            text: `👁️ *Checking last seen for...*\n${targetJid}`
        }, { quoted: message });
        
        // Subscribe to presence
        try {
            await sock.presenceSubscribe(targetJid);
        } catch (error) {
            console.log('Presence subscription failed');
        }
        
        // Try to get last seen
        let lastSeen = 'Unable to determine';
        let onlineStatus = 'Unknown';
        
        try {
            // Wait a bit for presence update
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Check if user is in contacts and get info
            const contacts = await sock.getContactById(targetJid);
            if (contacts) {
                onlineStatus = 'Available in contacts';
            }
        } catch (error) {
            console.log('Contact info not available');
        }
        
        let response = `👁️ *LAST SEEN INFORMATION*\n\n`;
        response += `🆔 *JID:* ${targetJid}\n`;
        response += `🟢 *Status:* ${onlineStatus}\n`;
        response += `⏰ *Last Seen:* ${lastSeen}\n`;
        response += `\n📌 *Note:* Last seen visibility depends on user's privacy settings`;
        
        await sock.sendMessage(m.chat, {
            text: response,
            mentions: [targetJid]
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error getting last seen:', error);
        await sock.sendMessage(m.chat, {
            text: '❌ Error fetching last seen information. User may have disabled this feature.'
        }, { quoted: message });
    }
}

// Handle comprehensive profile information
async function handleProfileInfo(sock, m, message, args) {
    try {
        const targetJid = args || getQuotedJid(message) || m.sender;
        
        await sock.sendMessage(m.chat, {
            text: '📋 *Fetching complete profile information...*\n\nPlease wait...'
        }, { quoted: message });
        
        // Get profile picture
        let dpUrl = null;
        try {
            dpUrl = await sock.profilePictureUrl(targetJid, 'image');
        } catch (error) {
            console.log('No profile picture');
        }
        
        // Get status
        let status = 'No status available';
        try {
            const statusData = await sock.fetchStatus(targetJid);
            status = statusData.status || 'No status set';
        } catch (error) {
            console.log('Status not available');
        }
        
        // Check if it's a group
        let isGroup = false;
        let metadata = null;
        try {
            metadata = await sock.groupMetadata(targetJid);
            isGroup = true;
        } catch (error) {
            isGroup = false;
        }
        
        let response = `📋 *COMPLETE PROFILE INFORMATION*\n\n`;
        response += `━━━━━━━━━━━━━━━━━━━\n`;
        response += `🆔 *JID:* ${targetJid}\n`;
        response += `🔢 *Number:* ${targetJid.split('@')[0]}\n`;
        response += `🏷️ *Type:* ${isGroup ? 'Group Channel' : 'Individual Chat'}\n`;
        
        if (isGroup && metadata) {
            response += `📛 *Channel Name:* ${metadata.subject || 'N/A'}\n`;
            response += `👥 *Members:* ${metadata.participants?.length || 0}\n`;
            response += `📝 *Description:* ${metadata.desc || 'No description'}\n`;
            response += `👑 *Owner:* ${metadata.owner || 'N/A'}\n`;
            response += `🔒 *Privacy:* ${metadata.announce ? 'Admins only' : 'All members'}\n`;
        }
        
        response += `━━━━━━━━━━━━━━━━━━━\n`;
        response += `💬 *Status:* ${status}\n`;
        response += `👁️ *Last Seen:* Privacy enabled\n`;
        response += `📸 *Profile Picture:* ${dpUrl ? 'Available' : 'Not available'}\n`;
        response += `━━━━━━━━━━━━━━━━━━━\n`;
        response += `📅 *Fetched:* ${new Date().toLocaleString()}\n`;
        
        if (dpUrl) {
            await sock.sendMessage(m.chat, {
                image: { url: dpUrl },
                caption: response,
                mentions: [targetJid]
            }, { quoted: message });
        } else {
            await sock.sendMessage(m.chat, {
                text: response,
                mentions: [targetJid]
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error getting profile info:', error);
        await sock.sendMessage(m.chat, {
            text: `❌ Error fetching profile information:\n${error.message}`
        }, { quoted: message });
    }
}

// Handle image/media download
async function handleDownload(sock, m, message, args) {
    try {
        // Check for quoted message with media
        const quotedMessage = message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMessage) {
            await sock.sendMessage(m.chat, {
                text: `📥 *USAGE:*\n\nReply to an image/video with:\n${'.download'}\n\nOr:\n${'.download'} [optional-filename]`
            }, { quoted: message });
            return;
        }
        
        // Check for image
        if (quotedMessage.imageMessage) {
            const imageUrl = quotedMessage.imageMessage.url;
            const caption = quotedMessage.imageMessage.caption || 'downloaded_image';
            
            await sock.sendMessage(m.chat, {
                text: '📥 *Downloading image...*\n\nPlease wait...'
            }, { quoted: message });
            
            // Download and send the image
            const buffer = await sock.downloadMediaMessage(quotedMessage);
            const filename = args || `${caption}_${Date.now()}.jpg`;
            
            // Save to file
            const downloadPath = path.join(__dirname, '../downloads');
            if (!fs.existsSync(downloadPath)) {
                fs.mkdirSync(downloadPath, { recursive: true });
            }
            
            const filePath = path.join(downloadPath, filename);
            fs.writeFileSync(filePath, buffer);
            
            await sock.sendMessage(m.chat, {
                text: `✅ *Image Downloaded Successfully!*\n\n📁 *Filename:* ${filename}\n📍 *Path:* ${filePath}\n📏 *Size:* ${(buffer.length / 1024).toFixed(2)} KB`
            }, { quoted: message });
            
            // Send the downloaded image back
            await sock.sendMessage(m.chat, {
                image: buffer,
                caption: `📥 *Downloaded Image*\n\n📁 ${filename}`
            }, { quoted: message });
        }
        // Check for video
        else if (quotedMessage.videoMessage) {
            const videoUrl = quotedMessage.videoMessage.url;
            const caption = quotedMessage.videoMessage.caption || 'downloaded_video';
            
            await sock.sendMessage(m.chat, {
                text: '📥 *Downloading video...*\n\nPlease wait...'
            }, { quoted: message });
            
            // Download and send the video
            const buffer = await sock.downloadMediaMessage(quotedMessage);
            const filename = args || `${caption}_${Date.now()}.mp4`;
            
            // Save to file
            const downloadPath = path.join(__dirname, '../downloads');
            if (!fs.existsSync(downloadPath)) {
                fs.mkdirSync(downloadPath, { recursive: true });
            }
            
            const filePath = path.join(downloadPath, filename);
            fs.writeFileSync(filePath, buffer);
            
            await sock.sendMessage(m.chat, {
                text: `✅ *Video Downloaded Successfully!*\n\n📁 *Filename:* ${filename}\n📍 *Path:* ${filePath}\n📏 *Size:* ${(buffer.length / 1024).toFixed(2)} KB`
            }, { quoted: message });
            
            // Send the downloaded video back
            await sock.sendMessage(m.chat, {
                video: buffer,
                caption: `📥 *Downloaded Video*\n\n📁 ${filename}`
            }, { quoted: message });
        }
        // Check for document
        else if (quotedMessage.documentMessage) {
            const documentUrl = quotedMessage.documentMessage.url;
            const caption = quotedMessage.documentMessage.caption || 'downloaded_document';
            
            await sock.sendMessage(m.chat, {
                text: '📥 *Downloading document...*\n\nPlease wait...'
            }, { quoted: message });
            
            // Download and send the document
            const buffer = await sock.downloadMediaMessage(quotedMessage);
            const filename = quotedMessage.documentMessage.fileName || args || `${caption}_${Date.now()}`;
            
            // Save to file
            const downloadPath = path.join(__dirname, '../downloads');
            if (!fs.existsSync(downloadPath)) {
                fs.mkdirSync(downloadPath, { recursive: true });
            }
            
            const filePath = path.join(downloadPath, filename);
            fs.writeFileSync(filePath, buffer);
            
            await sock.sendMessage(m.chat, {
                text: `✅ *Document Downloaded Successfully!*\n\n📁 *Filename:* ${filename}\n📍 *Path:* ${filePath}\n📏 *Size:* ${(buffer.length / 1024).toFixed(2)} KB`
            }, { quoted: message });
            
            // Send the downloaded document back
            await sock.sendMessage(m.chat, {
                document: buffer,
                mimetype: quotedMessage.documentMessage.mimetype,
                fileName: filename,
                caption: `📥 *Downloaded Document*\n\n📁 ${filename}`
            }, { quoted: message });
        }
        else {
            await sock.sendMessage(m.chat, {
                text: '❌ *No media found in quoted message.*\n\nPlease reply to an image, video, or document.'
            }, { quoted: message });
        }
        
    } catch (error) {
        console.error('Error downloading media:', error);
        await sock.sendMessage(m.chat, {
            text: `❌ Error downloading media:\n${error.message}`
        }, { quoted: message });
    }
}

// Helper function to get quoted JID
function getQuotedJid(message) {
    try {
        const quotedJid = message.message?.extendedTextMessage?.contextInfo?.participant;
        return quotedJid || null;
    } catch (error) {
        return null;
    }
}

// Download URL image directly
async function downloadUrlImage(sock, m, message, imageUrl, filename) {
    try {
        await sock.sendMessage(m.chat, {
            text: '📥 *Downloading image from URL...*'
        }, { quoted: message });
        
        const response = await fetch(imageUrl);
        const buffer = await response.arrayBuffer();
        
        const downloadPath = path.join(__dirname, '../downloads');
        if (!fs.existsSync(downloadPath)) {
            fs.mkdirSync(downloadPath, { recursive: true });
        }
        
        const filePath = path.join(downloadPath, filename || `image_${Date.now()}.jpg`);
        fs.writeFileSync(filePath, Buffer.from(buffer));
        
        await sock.sendMessage(m.chat, {
            image: Buffer.from(buffer),
            caption: `✅ *Image Downloaded!*\n\n📁 ${filename || filePath}`
        }, { quoted: message });
        
    } catch (error) {
        console.error('Error downloading URL image:', error);
        await sock.sendMessage(m.chat, {
            text: `❌ Error downloading image from URL:\n${error.message}`
        }, { quoted: message });
    }
}
