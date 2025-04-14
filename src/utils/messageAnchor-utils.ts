import { MessageAnchor } from "../types/types";
import { getConversationKey, isConversationExisted } from "./conversation-utils";
export function deserializeMessageAnchor(messageAnchor: string): MessageAnchor {
    const parsedMessageAnchor = JSON.parse(messageAnchor);
    return {...parsedMessageAnchor, 
        createdAt: new Date(parsedMessageAnchor.createdAt)};
}

export function serializeMessageAnchor(messageAnchor: MessageAnchor): string {
    return JSON.stringify({...messageAnchor, 
        createdAt: messageAnchor.createdAt.toISOString()});
}

