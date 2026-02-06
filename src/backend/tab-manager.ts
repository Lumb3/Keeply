/// <reference types="chrome" />
// tab-manager.ts

export async function getAllTabsCount(): Promise<number> {
    try {
        const tabs = await chrome.tabs.query({});
        return tabs.length;
    } catch (error) {
        console.error('Error getting tab count:', error);
        return 0;
    }
}