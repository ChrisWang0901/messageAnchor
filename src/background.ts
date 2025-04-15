import { ConversationData, MessageAnchor } from "./types/types";
import { getConversation, saveConversation } from "./utils/conversation-utils";
import { handleTabRemoved, navigateToConversationTab } from "./utils/tab-utils";
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "message-anchor",
    title: "Anchor the selected message",
    contexts: ["selection"],
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "navigateToMessage") {
    const messageAnchorData = request.data;
  } else if (request.action === "navigateToConversation") {
    const conversationData = request.data  as ConversationData;
    navigateToConversationTab(conversationData.id);
    console.log("Navigated to conversation:", conversationData.id);

  }
});

// Open side panel when keyboard shortcut is triggered
chrome.commands.onCommand.addListener((command) => {
  console.log("Received command:", command);

  if (command === "open-sidepanel") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id;
      if (!tabId) return;

      chrome.sidePanel.open({ tabId });
    });
  }
  if (command === "close-sidepanel") {
    chrome.runtime.sendMessage("closeSidePanel");
  }
  if (command === "anchor-message") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        anchorSelectedMessage(tabs[0]);
      }
    });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId !== "message-anchor" || !info.selectionText || !tab?.id) {
    return;
  }
  anchorSelectedMessage(tab);
});

// Function to handle anchoring the selected message
async function anchorSelectedMessage(tab: chrome.tabs.Tab) {
  if (!tab?.id) return;

  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const sel = document.getSelection();
        if (!sel || sel.rangeCount === 0) return null;

        let node = sel.anchorNode;
        while (node && !(node instanceof Element)) node = node.parentNode;

        let messageId = null;
        let dataStart = null;

        for (let cur = node; cur; cur = cur.parentElement) {
          if (
            !dataStart &&
            cur.tagName === "P" &&
            cur.hasAttribute("data-start")
          ) {
            dataStart = cur.getAttribute("data-start");
          }
          if (cur.hasAttribute?.("data-message-id")) {
            messageId = cur.getAttribute("data-message-id");
            break;
          }
        }

        return { messageId, dataStart, selectionText: sel.toString() };
      },
    });

    if (!result) {
      throw new Error("No message ID or data start found");
    }
    const { messageId, dataStart, selectionText } = result;
    if (!messageId || !dataStart) {
      throw new Error("No message ID or data start found");
    }
    const conversationId: string | null = getCurrentConversationId(tab);
    if (!conversationId) {
      throw new Error("No conversation ID found");
    }

    const messageAnchor: MessageAnchor = {
      id: `${messageId}:${dataStart}`,
      dataStart,
      createdAt: new Date(),
      conversationId: conversationId,
      name: selectionText,
    };
    let conversation = await getConversation(conversationId);
    if (!conversation) {
      const title = await getCurrentConversationTitle(tab);
      console.log("Title:", title);
      conversation = {
        id: conversationId.toString(),
        createdAt: new Date(),
        messages: [],
        title: title,
        tabId: tab.id.toString(),
      };
    }
    conversation.messages.push(messageAnchor);
    await saveConversation(conversation);
    console.log("Message anchor:", messageAnchor);
  } catch (error) {
    console.error("Error anchoring message:", error);
  }
}

function getCurrentConversationId(tab: chrome.tabs.Tab) {
  if (!tab.url || !tab.id) return null;
  const url = new URL(tab.url);
  let conversationId = null;
  if (
    url.hostname.includes("chatgpt.com") ||
    url.hostname.includes("chat.openai.com")
  ) {
    const match = url.pathname.match(/\/c\/([a-f0-9-]+)/i);
    if (match) {
      conversationId = match[1]; // ← the UUID
    }
  }

  return conversationId;
}

async function getCurrentConversationTitle(
  tab: chrome.tabs.Tab
): Promise<string> {
  if (!tab.id) return "No Title Found";

  try {
    const [{ result: title }] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        return document.title || "No Title Found";
      },
    });
    console.log("Title:", title);
    return title || "No Title Found";
  } catch (error) {
    console.error("Failed to extract title:", error);
    return "No Title Found";
  }
}

chrome.tabs.onRemoved.addListener(async (tabId) => {
  await handleTabRemoved(tabId);
});