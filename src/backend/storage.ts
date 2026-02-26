// storage.ts

export interface TabGroup {
  id: string;
  name: string;
  tabCount: number;
  timestamp: string;
  color: string;
  tabs: Array<{
    title: string;
    url: string;
    favicon?: string;
  }>;
}

// Save a new tab group
export async function saveTabGroup(group: TabGroup): Promise<void> {
  try {
    const result = await chrome.storage.local.get("tabGroups");
    const existingGroups: TabGroup[] = (result.tabGroups as TabGroup[]) || [];

    // Add new group to the beginning of the array
    const updatedGroups = [group, ...existingGroups];

    await chrome.storage.local.set({ tabGroups: updatedGroups });
    console.log("Tab group saved successfully:", group);
  } catch (error) {
    console.error("Error saving tab group:", error);
    throw error;
  }
}

// Get all tab groups
export async function getAllTabGroups(): Promise<TabGroup[]> {
  try {
    const result = await chrome.storage.local.get("tabGroups");
    const groups = (result.tabGroups as TabGroup[]) || [];
    console.log('getAllTabGroups -> ', groups);
    return groups;
  } catch (error) {
    console.error("Error getting tab groups:", error);
    return [];
  }
}

// Get recent tab groups (limit to N)
export async function getRecentTabGroups(limit: number = 3): Promise<TabGroup[]> {
  const allGroups = await getAllTabGroups();
  return allGroups.slice(0, limit);
}

// Delete a tab group by ID
export async function deleteTabGroup(id: string): Promise<void> {
  try {
    const result = await chrome.storage.local.get("tabGroups");
    const existingGroups: TabGroup[] = (result.tabGroups as TabGroup[]) || [];

    const updatedGroups = existingGroups.filter(group => group.id !== id);

    await chrome.storage.local.set({ tabGroups: updatedGroups });
    console.log("Tab group deleted:", id);
  } catch (error) {
    console.error("Error deleting tab group:", error);
    throw error;
  }
}

// Update a tab group
export async function updateTabGroup(updatedGroup: TabGroup): Promise<void> {
  try {
    const result = await chrome.storage.local.get("tabGroups");
    const existingGroups: TabGroup[] = (result.tabGroups as TabGroup[]) || [];

    const updatedGroups = existingGroups.map(group =>
      group.id === updatedGroup.id ? updatedGroup : group
    );

    await chrome.storage.local.set({ tabGroups: updatedGroups }).then(() => {
      console.log("Tab Group is updated!");
    });
    console.log("Tab group updated:", updatedGroup);
  } catch (error) {
    console.error("Error updating tab group:", error);
    throw error;
  }
}

// Get count of saved groups
export async function getTabGroupsCount(): Promise<number> {
  const groups = await getAllTabGroups();
  return groups.length;
}

// Format timestamp to relative time (e.g., "2h ago")
export function formatRelativeTime(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const diffMs = now.getTime() - past.getTime();

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return past.toLocaleDateString();
}