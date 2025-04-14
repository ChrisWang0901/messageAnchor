import { Conversation, MessageAnchor } from "../types/types";
import { serializeMessageAnchor, deserializeMessageAnchor } from "./messageAnchor-utils";

export function deserializeConversation(conversation: string): Conversation {
    const parsedConversation = JSON.parse(conversation);
    return {...parsedConversation, 
        createdAt: new Date(parsedConversation.createdAt),
        messages: parsedConversation.messages.map((message: string) => deserializeMessageAnchor(message))};
}

export function serializeConversation(conversation: Conversation): string {
    return JSON.stringify({...conversation, 
        createdAt: conversation.createdAt.toISOString(),
        messages: conversation.messages.map((message: MessageAnchor) => serializeMessageAnchor(message))});
}

export async function loadConversationList(): Promise<Conversation[]> {
    const allObjects = await chrome.storage.local.get(null);
    const conversationList = Object.entries(allObjects)
    .filter(([k]) => k.startsWith('conv:'))
    .map(([, v]) => v as Conversation);
    return conversationList;
}


export async function isConversationExisted(conversationId: string): Promise<boolean> {
    const key = getConversationKey(conversationId);
    const result = await chrome.storage.local.get(key);
    return key in result;
}

export async function saveConversation(conversation: Conversation) {
    const key = getConversationKey(conversation.id);
    await chrome.storage.local.set({[key]: serializeConversation(conversation)});
}

export async function deleteConversation(conversationId: string) {
    const key = getConversationKey(conversationId);
    await chrome.storage.local.remove(key);
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
    const key = getConversationKey(conversationId);
    const result = await chrome.storage.local.get(key);
    return result[key] ? deserializeConversation(result[key]) : null;
}


export function getConversationKey(conversationId: string): string {
    return `conv:${conversationId}`;
}

