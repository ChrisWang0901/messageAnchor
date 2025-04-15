export interface MessageAnchor {
    id: string;
    name: string;
    conversationId: string;
    dataStart: string;
    createdAt: Date;
}

export interface MessageAnchorData {
    id: string;
    conversationId: string;
    dataStart: string;
}

export interface Conversation {
    id: string;
    title: string;
    createdAt: Date;
    tabId: string;
    messages: MessageAnchor[];
}

export interface ConversationData {
    id: string;
    tabId: string;
}

export type ConversationTabMap = Record<string, number>;
