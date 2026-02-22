// Gets the number of open tabs, returns Promise with number type
export async function getAllTabsCount(): Promise<number> {
    try {
        const tabs = await chrome.tabs.query({});
        return tabs.length;
    } catch (error) {
        console.error('Error getting tab count:', error);
        return 0;
    }
}
