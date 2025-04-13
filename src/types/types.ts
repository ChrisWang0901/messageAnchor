export interface MessageAnchor {
    id: string;
    name: string;
    tabId: string;
    dataStart: string;
    createdAt: Date;
}

export interface Conversation {
    id: string;
    title: string;
    createdAt: Date;
    tabId: string;
    messages: MessageAnchor[];
}
