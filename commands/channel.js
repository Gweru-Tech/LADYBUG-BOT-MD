const channelCommand = {
    async execute(sock, chatUpdate, isFromMe) {
        const message = chatUpdate.messages[0];
        const from = message.key.remoteJid;
        const userMessage = message.message?.conversation || message.message?.extendedTextMessage?.text || '';

        let targetJid = from;

        if (!from.endsWith('@newsletter')) {
            const args = userMessage.split(' ').slice(1);
            if (args.length > 0 && args[0].endsWith('@newsletter')) {
                targetJid = args[0];
            } else {
                await sock.sendMessage(from, { text: 'Please provide a valid channel JID (e.g., .channel 120363XXXXXX@newsletter) or run this in a channel chat.' });
                return;
            }
        }

        try {
            const channelMetadata = await sock.newsletterMetadata(targetJid);
            const channelJid = channelMetadata.id;
            const channelName = channelMetadata.name;
            const subscriberCount = channelMetadata.subscribers;

            const response = `Channel JID: ${channelJid}\nChannel Name: ${channelName}\nSubscribers: ${subscriberCount}`;
            await sock.sendMessage(from, { text: response }, { quoted: message });
        } catch (error) {
            console.error('Error fetching channel JID:', error);
            await sock.sendMessage(from, { text: 'Failed to retrieve channel info. Ensure the JID is correct and the channel exists.' });
        }
    }
};
