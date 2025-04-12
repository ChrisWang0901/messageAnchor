import { Conversation, MessageAnchor } from "./types/types";

const storageKey = 'conversation-anchor';

document.addEventListener('DOMContentLoaded', async () => {
    const conversations = await getConversations();
    renderConversations(conversations);
});

async function getConversations() {
    const result = await chrome.storage.local.get(storageKey);
    const storedData = result[storageKey] || [];
    const conversations = storedData.map((conversation) : Conversation => {
        return {
            id: conversation.id,
            title: conversation.title,
            createdAt: new Date(conversation.createdAt),
            tabId: conversation.tabId,
            messages: conversation.messages?.map(msg => ({
                id: msg.id,
                name: msg.content,
                createdAt: new Date(msg.createdAt),
                dataStart: msg.dataStart,
            })),
        };
    });
    return conversations;
}


function renderConversations(conversations: Conversation[]) {
    const conversationList = document.getElementById('conversation-list');
    if (!conversationList) {
        return;
    }
    conversationList.innerHTML = '';
    const fragment = document.createDocumentFragment();
    conversations.forEach((conversation) => {
        const li = document.createElement('li');
        li.title = conversation.title;
        li.dataset.tabId = conversation.tabId;
        li.dataset.id = conversation.id;

        // Add message anchors
        const messageAnchors = document.createElement('ul');
        messageAnchors.appendChild(buildMessageAnchors(conversation.messages));

        // Add conversations
        li.appendChild(messageAnchors);
        fragment.appendChild(li);
    });
    conversationList.appendChild(fragment);
}

function buildMessageAnchors(messages: MessageAnchor[]) {
    const fragment = document.createDocumentFragment();
    messages.forEach((message) => {
        const li = document.createElement('li');
        li.title = message.name;
        li.dataset.id = message.id;
        li.dataset.tabId = message.tabId;
        li.dataset.dataStart = message.dataStart;
        fragment.appendChild(li);
    });
    return fragment;
}


function deleteConversation(conversationId: string) {
}

function deleteMessage(messageId: string) {
}

function navigateToConversation(conversationId: string) {
}

function navigateToMessage(messageId: string) {
}