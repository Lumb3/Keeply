// background.ts
import { getAllTabsCount } from "./tab-manager";

console.log("Background script loaded.");

// Initialize badge on startup
updateBadge();

// Listen for tab changes
chrome.tabs.onCreated.addListener(() => {
    console.log('New tab created');
    updateBadge();
    // TODO: Trigger auto-save logic here
});

chrome.tabs.onRemoved.addListener(() => {
    console.log('Tab removed');
    updateBadge();
});

// Update the extension icon badge with the current tab count
async function updateBadge() {
    try {
        const count = await getAllTabsCount();
        chrome.action.setBadgeText({ text: count.toString() });
        chrome.action.setBadgeBackgroundColor({ color: '#8B5CF6' });
    } catch (error) {
        console.error('Error updating badge:', error);
    }
}