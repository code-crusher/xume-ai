import { WebClient } from "@slack/web-api";

const slack = new WebClient(process.env.SLACK_TOKEN);

/**
 * Finds a channel ID using its name
 * @param channelName The name of the channel to find
 * @returns Promise with the channel ID or undefined if not found
 */
const findChannelId = async (data: any): Promise<string | undefined> => {
    try {
        // List all channels the bot has access to
        const result = await slack.conversations.list();

        if (!result.channels) {
            return undefined;
        }

        // Find channel with matching name
        const channel = result.channels.find(
            (channel) => channel.name === data.channelName.replace('#', '')
        );

        return channel?.id;
    } catch (error) {
        console.error('Error finding Slack channel:', error);
        throw error;
    }
}

findChannelId.schema = {
    channelName: "string"
}

/**
 * Sends a message to a Slack channel or user
 * @param channel The channel ID or user ID to send the message to
 * @param text The message text
 * @returns Promise with the message response
 */
const sendMessage = async (data: any) => {
    try {
        return await slack.chat.postMessage({
            channel: data.channelId,
            text: data.text
        });
    } catch (error) {
        console.error('Error sending Slack message:', error);
        throw error;
    }
}

sendMessage.schema = {
    channelId: "string",
    text: "string"
}

/**
 * Updates an existing message
 * @param channel The channel ID where the message exists
 * @param ts The timestamp of the message to update
 * @param text The new message text
 * @returns Promise with the update response
 */
const updateMessage = async (data: any) => {
    try {
        return await slack.chat.update({
            channel: data.channel,
            ts: data.ts,
            text: data.text
        });
    } catch (error) {
        console.error('Error updating Slack message:', error);
        throw error;
    }
}

updateMessage.schema = {
    channel: "string",
    ts: "string",
    text: "string"
}

/**
 * Deletes a message from a channel
 * @param channel The channel ID where the message exists
 * @param ts The timestamp of the message to delete
 * @returns Promise with the deletion response
 */
const deleteMessage = async (data: any) => {
    try {
        return await slack.chat.delete({
            channel: data.channel,
            ts: data.ts
        });
    } catch (error) {
        console.error('Error deleting Slack message:', error);
        throw error;
    }
}

deleteMessage.schema = {
    channel: "string",
    ts: "string"
}

/**
 * Adds a reaction to a message
 * @param channel The channel ID where the message exists
 * @param ts The timestamp of the message
 * @param reaction The emoji name without colons
 * @returns Promise with the reaction response
 */
const addReaction = async (data: any) => {
    try {
        return await slack.reactions.add({
            channel: data.channel,
            timestamp: data.ts,
            name: data.reaction
        });
    } catch (error) {
        console.error('Error adding reaction:', error);
        throw error;
    }
}

addReaction.schema = {
    channel: "string",
    ts: "string",
    reaction: "string"
}

export default {
    sendMessage,
    updateMessage,
    deleteMessage,
    addReaction,
    findChannelId
}