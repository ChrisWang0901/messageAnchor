const CONV_TAB_KEY_PREFIX = "convTab:"; 
const CONV_URL = "https://chatgpt.com/c/";

export async function getConversationTabId(conversationId: string) : Promise<number | undefined> {
  const conversationTabMap = await chrome.storage.session.get(CONV_TAB_KEY_PREFIX);
  return conversationTabMap[CONV_TAB_KEY_PREFIX + conversationId];
}

export function removeConversationTabId(conversationId: string) {
    return chrome.storage.session.remove(CONV_TAB_KEY_PREFIX + conversationId);
}

// remove tab id by passing tabId
export async function handleTabRemoved(tabId: number) {
    const sessionStore = await chrome.storage.session.get(null);
    // iterave over all objects and remvoe the value that has the tabId
    const removeKeys: string[] = [];
    for (const [k,v ] of Object.entries(sessionStore)) {
        if(k.startsWith(CONV_TAB_KEY_PREFIX) && v === tabId) {
            removeKeys.push(k);
        }
    }
    if (removeKeys.length > 0) {
        await chrome.storage.session.remove(removeKeys);
    }
}

export async function navigateToConversationTab(conversationId: string) {
    const tabId = await getConversationTabId(conversationId);
    if (tabId) {
        try {
            const tab = await chrome.tabs.get(tabId);
            await chrome.windows.update(tab.windowId, { focused: true });
            await chrome.tabs.update(tabId, { active: true });
        } catch (error) {
            // remove stale tab id
            await chrome.storage.session.remove(CONV_TAB_KEY_PREFIX + conversationId);
        }
    } else {
        // create new tab
        const url = CONV_URL + conversationId;
        const tab = await chrome.tabs.create({ url: url });
        await chrome.storage.session.set({ [CONV_TAB_KEY_PREFIX + conversationId]: tab.id });
    }
}
