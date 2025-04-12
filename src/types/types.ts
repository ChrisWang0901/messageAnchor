export interface Message {
    id: string;
    name: string;
    createdAt: Date;
}

export interface Conversation {
    id: string;
    title: string;
    createdAt: Date;
    messages: Message[];
}
