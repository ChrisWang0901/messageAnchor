import { MessageAnchor } from './types/types';

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'message-anchor',
        title: 'Anchor the selected message',
        contexts: ['selection'],
    });
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
        chrome.runtime.sendMessage('closeSidePanel');
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
    if (info.menuItemId !== 'message-anchor' || !info.selectionText || !tab?.id) {
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
          if (!dataStart && cur.tagName === "P" && cur.hasAttribute("data-start")) {
            dataStart = cur.getAttribute("data-start");
          }
          if (cur.hasAttribute?.("data-message-id")) {
            messageId = cur.getAttribute("data-message-id");
            break;
          }
        }

        return { messageId, dataStart, selectionText: sel.toString() };
      }
    });

    if (!result) {
        throw new Error('No message ID or data start found');
    }
    const { messageId, dataStart, selectionText } = result;
    if (!messageId || !dataStart) {
        throw new Error('No message ID or data start found');
    }
    const messageAnchor : MessageAnchor = {
        id:  `${messageId}:${dataStart}`,
        dataStart,
        createdAt: new Date(),
        tabId: tab.id.toString(),
        name: selectionText,
    };
    console.log('Message anchor:', messageAnchor);
  } catch (error) {
    console.error('Error anchoring message:', error);
  }
}

