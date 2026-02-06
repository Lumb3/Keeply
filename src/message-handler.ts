// message-handler.ts
/// <reference types="chrome" />
import { getAllTabsCount } from "./backend/tab-manager";

export function setupMessageHandler() {
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    handleMessage(request).then(sendResponse).catch(error => {
      console.error('Message handler error:', error);
      sendResponse({ error: error.message });
    });
    return true; // Keep channel open for async response
  });
}

async function handleMessage(request: any) {
  switch (request.type) {
    case "GET_TAB_COUNT":
      return {
        tabCount: await getAllTabsCount()
      };
    default:
      return { error: "Unknown message type" };
  }
}

// If calling from popup, use this safer version
export async function getTabCount(): Promise<number> {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ type: "GET_TAB_COUNT" }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Runtime error:', chrome.runtime.lastError);
        reject(chrome.runtime.lastError);
        return;
      }
      resolve(response?.tabCount || 0);
    });
  });
}

// OPTION 2 (BETTER): If calling from popup, directly import and use
// This avoids unnecessary message passing:
// import { getAllTabsCount } from "./backend/tab-manager";
// const count = await getAllTabsCount();