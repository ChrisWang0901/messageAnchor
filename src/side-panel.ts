import { Conversation, MessageAnchor, ConversationData, MessageAnchorData } from "./types/types";
const conversationListElement = document.getElementById('conversation-list');
import { createIcons } from 'lucide';
import { icons } from './icons/icons';
import { loadConversationList } from "./utils/conversation-utils";
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOMContentLoaded');
    debugger;
    const conversationList = await loadConversationList();
    renderConversationList(conversationList);
    createIcons({icons});
});

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
        
        // Create action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('actions');
        
        // Add navigate button with Compass icon
        const navigateBtn = document.createElement('button');
        navigateBtn.dataset.action = 'navigateTo';
        const navIcon = document.createElement('i');
        navIcon.dataset.lucide = 'compass';
        navigateBtn.appendChild(navIcon);
        actionsContainer.appendChild(navigateBtn);
        
        // Add delete button with Trash2 icon
        const deleteBtn = document.createElement('button');
        deleteBtn.dataset.action = 'delete';
        const deleteIcon = document.createElement('i');
        deleteIcon.dataset.lucide = 'trash-2';
        deleteBtn.appendChild(deleteIcon);
        actionsContainer.appendChild(deleteBtn);
        
        // Add folder icon
        const folderIcon = document.createElement('i');
        folderIcon.dataset.lucide = 'folder-closed';
        li.prepend(folderIcon);
        
        // Add actions to the li
        li.appendChild(actionsContainer);
        
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
        li.dataset.conversationId = message.conversationId;
        li.dataset.dataStart = message.dataStart;
        
        // Create action buttons container
        const actionsContainer = document.createElement('div');
        actionsContainer.classList.add('actions');
        
        // Add navigate button with Compass icon
        const navigateBtn = document.createElement('button');
        navigateBtn.dataset.action = 'navigateTo';
        const navIcon = document.createElement('i');
        navIcon.dataset.lucide = 'compass';
        navigateBtn.appendChild(navIcon);
        actionsContainer.appendChild(navigateBtn);
        
        // Add delete button with Trash2 icon
        const deleteBtn = document.createElement('button');
        deleteBtn.dataset.action = 'delete';
        const deleteIcon = document.createElement('i');
        deleteIcon.dataset.lucide = 'trash-2';
        deleteBtn.appendChild(deleteIcon);
        actionsContainer.appendChild(deleteBtn);
        
        // Add actions to the li
        li.appendChild(actionsContainer);
        
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
        const conversationData = {
            id: data.id,
            tabId: data.tabId,
        } as ConversationData;
        handleConversation(conversationData, action);
    } else if (liClass.contains('messageAnchor')) {
        const messageAnchorData = {
            id: data.id,
            conversationId: data.conversationId,
            dataStart: data.dataStart,
        } as MessageAnchorData;
        handleMessageAnchor(messageAnchorData, action);
    }
});

function handleConversation(data: ConversationData, action: string) {
    switch (action) {
        case 'delete':
            deleteConversation(data.id);
            console.log('delete conversation', data);
            break;
        case 'navigateTo':
            navigateToConversation(data);
            console.log('navigate to conversation', data);
            break;
        default:
            console.log('unknown action');
            break;
    }
}

function handleMessageAnchor(data: MessageAnchorData, action: string) {
    switch (action) {
        case 'delete':
            deleteMessage(data.id);
            console.log('delete message', data);
            break;
        case 'navigateTo':
            navigateToMessage(data);
            console.log('navigate to message', data);
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

function navigateToConversation(data: ConversationData) {
    chrome.runtime.sendMessage({
        action: 'navigateToConversation',
        data: data,
    });
}

function navigateToMessage(data: MessageAnchorData) {
    chrome.runtime.sendMessage({
        action: 'navigateToMessage',
        data: data,
    });
}

chrome.runtime.onMessage.addListener(message => {
    if (message === 'closeSidePanel') {
      window.close();
    }
  })