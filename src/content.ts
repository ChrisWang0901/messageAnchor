/**
 * Content script for the extension.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Received message:', request);
});