import { Conversation, MessageAnchor } from "./types/types";
import { mockConversationList } from "./mock/mockData";
const storageKey = 'conversation-anchor';
const conversationListElement = document.getElementById('conversation-list');
import { createIcons } from 'lucide';
import { icons } from './icons/icons';
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded');
    debugger;
    const conversationList = await getConversationList();
    renderConversationList(conversationList);
    createIcons({icons});
});

async function getConversationList() {
/*     const result = await chrome.storage.local.get([storageKey]);
    const storedData = result[storageKey] || []; */
    const storedData = mockConversationList;
    const conversations = storedData.map((conversation: any) : Conversation => {
        return {
            id: conversation.id,
            title: conversation.title,
            createdAt: new Date(conversation.createdAt),
            tabId: conversation.tabId,/*  */
            messages: conversation.messages?.map((msg: any): MessageAnchor => ({
                id: msg.id,
                name: msg.content,
                createdAt: new Date(msg.createdAt),
                dataStart: msg.dataStart,
                tabId: msg.tabId,
            })),
        };
    });
    return conversations;
}


function renderConversationList(conversationList: Conversation[]) {
    const conversationListElement = document.getElementById('conversation-list');
    if (!conversationListElement) {
        return;
    }
    conversationListElement.innerHTML = '';
    const fragment = document.createDocumentFragment();
    conversationList.forEach((conversation) => {
        const li = document.createElement('li');
        li.classList.add('conversation');
        li.textContent = conversation.title;
        li.title = conversation.title;
        li.dataset.tabId = conversation.tabId;
        li.dataset.id = conversation.id;
        const icon = document.createElement('i');
        icon.dataset.lucide = 'folder-closed';
        li.prepend(icon);
        // Add message anchors
        const messageAnchorList = buildMessageAnchorList(conversation.messages);

        // Add conversations
        li.appendChild(messageAnchorList);
        fragment.appendChild(li);
    });
    conversationListElement.appendChild(fragment);
}

function buildMessageAnchorList(messages: MessageAnchor[]) {
    const ul = document.createElement('ul');
    messages.forEach((message) => {
        const li = document.createElement('li');
        li.classList.add('messageAnchor');
        li.textContent = message.name;
        li.title = message.name;
        li.dataset.id = message.id;
        li.dataset.tabId = message.tabId;
        li.dataset.dataStart = message.dataStart;
        ul.appendChild(li);
    });
    return ul;
}


conversationListElement?.addEventListener('click', (event) => {
    // find the action element
    const actionElement = (event.target as HTMLElement)?.closest('[data-action]');
    if (!(actionElement instanceof HTMLElement)) {
        console.log('no action element');
        return;
    }
    const action = actionElement.dataset.action;
    if (!action) {
        console.log('no action');
        return;
    }
    
    // get the closest parent li element
    const li = actionElement.closest('li');
    if (!(li instanceof HTMLElement)) {
        console.log('no li element');
        return;
    }
    // check li class (conversation or messageAnchor)
    const liClass = li.classList;
    const data = li.dataset;
    if (liClass.contains('conversation')) {
        handleConversation(data, action);
    } else if (liClass.contains('messageAnchor')) {
        handleMessageAnchor(data, action);
    }
});

function handleConversation(data: any, action: string) {
    switch (action) {
        case 'delete':
            deleteConversation(data.id);
            break;
        case 'navigateTo':
            navigateToConversation(data.id);
            break;
        default:
            console.log('unknown action');
            break;
    }
}

function handleMessageAnchor(data: any, action: string) {
    switch (action) {
        case 'delete':
            deleteMessage(data.id);
            break;
        case 'navigateTo':
            navigateToMessage(data.id);
            break;
        default:
            console.log('unknown action');
            break;
    }
}

function deleteConversation(conversationId: string) {
}

function deleteMessage(messageId: string) {
}

function navigateToConversation(conversationId: string) {
}

function navigateToMessage(messageId: string) {
}

chrome.runtime.onMessage.addListener(message => {
    if (message === 'closeSidePanel') {
      window.close();
    }
  })