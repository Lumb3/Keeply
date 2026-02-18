// library-page.tsx
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FolderOpen,
  Trash2,
  Edit3,
  ExternalLink,
  MoreVertical,
  Copy,
  Download,
  Check,
  X,
  Search,
} from "lucide-react";
import {
  getAllTabGroups,
  getTabGroupsCount,
  deleteTabGroup,
  updateTabGroup,
  saveTabGroup,
  formatRelativeTime,
  type TabGroup,
} from "../backend/storage";

interface LibraryPageProps {
  onOpenPopup: (page: "popup" | "library") => void;
}

export default function LibraryPage({ onOpenPopup }: LibraryPageProps) {
  const [groups, setGroups] = useState<TabGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<TabGroup[]>([]);
  const [groupCount, setGroupCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // Fetch groups and count
  const fetchData = async () => {
    try {
      const [fetchedGroups, count] = await Promise.all([
        getAllTabGroups(),
        getTabGroupsCount(),
      ]);
      // Sort by timestamp descending (most recent first)
      // ISO strings can be compared lexicographically
      fetchedGroups.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
      setGroups(fetchedGroups);
      setFilteredGroups(fetchedGroups);
      setGroupCount(count);
    } catch (error) {
      console.error("Error fetching library data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleStorageChange = () => fetchData();
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Filter groups when search changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredGroups(groups);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredGroups(
        groups.filter(
          (g) =>
            g.name.toLowerCase().includes(query) ||
            g.tabs.some((t) => t.title?.toLowerCase().includes(query))
        )
      );
    }
  }, [searchQuery, groups]);

  // Start editing a group name
  const handleStartEdit = (group: TabGroup) => {
    setEditingId(group.id);
    setEditingName(group.name);
    setActiveMenu(null);
  };

  // Save renamed group
  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      const groupToUpdate = groups.find((g) => g.id === id);
      if (!groupToUpdate) return;
      const updatedGroup = { ...groupToUpdate, name: editingName.trim() };
      await updateTabGroup(updatedGroup);
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error("Error renaming group:", error);
      alert("Failed to rename group. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // Delete a group with confirmation
  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        await deleteTabGroup(id);
        setActiveMenu(null);
      } catch (error) {
        console.error("Error deleting group:", error);
        alert("Failed to delete group. Please try again.");
      }
    }
  };

  // Duplicate a group
  const handleDuplicate = async (group: TabGroup) => {
    try {
      const { id, timestamp, ...groupData } = group; // omit id and timestamp
      const newGroup: Omit<TabGroup, "id" | "timestamp"> = {
        ...groupData,
        name: `${group.name} (Copy)`,
      };
      await saveTabGroup(newGroup as TabGroup); // saveTabGroup expects full TabGroup but will generate new id/timestamp
      setActiveMenu(null);
    } catch (error) {
      console.error("Error duplicating group:", error);
      alert("Failed to duplicate group. Please try again.");
    }
  };

  // Open all tabs in the group
  const handleOpenGroup = async (group: TabGroup) => {
    try {
      for (const tab of group.tabs) {
        await chrome.tabs.create({ url: tab.url, active: false });
      }
      // Focus the first new tab
      const tabs = await chrome.tabs.query({ currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.update(tabs[tabs.length - group.tabs.length].id!, {
          active: true,
        });
      }
    } catch (error) {
      console.error("Error opening group:", error);
      alert("Failed to open tabs. Please try again.");
    }
  };

  // Export group as JSON file
  const handleExport = (group: TabGroup) => {
    const dataStr = JSON.stringify(group, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${group.name.replace(/[^a-z0-9]/gi, "_")}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setActiveMenu(null);
  };

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "from-blue-500 to-cyan-500",
      purple: "from-purple-500 to-pink-500",
      red: "from-red-500 to-orange-500",
      green: "from-green-500 to-emerald-500",
      yellow: "from-yellow-500 to-amber-500",
      indigo: "from-indigo-500 to-violet-500",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="w-[360px] h-[500px] bg-white flex flex-col p-6 rounded-3xl border border-slate-200 overflow-hidden popup-fade-in relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenPopup("popup")}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all active:scale-95"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Tab Library
            </h1>
            <p className="text-sm text-slate-500">
              {groupCount} {groupCount === 1 ? "group" : "groups"}
            </p>
          </div>
        </div>
        <div className="px-4 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-medium">
          {groupCount} Sessions
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-4 flex-shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search groups or tabs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-300 transition-colors"
        />
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {loading ? (
          // Loading skeletons
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-slate-100 border-2 border-slate-200 rounded-2xl p-4 animate-pulse"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-300" />
                  <div className="flex-1">
                    <div className="h-4 bg-slate-300 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-300 rounded w-1/2" />
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="h-6 bg-slate-200 rounded" />
                  <div className="h-6 bg-slate-200 rounded" />
                </div>
                <div className="flex gap-2">
                  <div className="h-8 bg-slate-300 rounded flex-1" />
                  <div className="h-8 w-10 bg-slate-300 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          // Empty state
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              {searchQuery ? "No matching groups" : "No saved groups yet"}
            </h3>
            <p className="text-sm text-slate-500">
              {searchQuery
                ? "Try a different search term"
                : "Save your first tab group to get started"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 hover:border-violet-300 transition-all group relative"
              >
                {/* Group Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Color Badge */}
                    <div
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getColorClasses(
                        group.color
                      )} flex-shrink-0 shadow-md`}
                    />

                    {/* Name (Editable) */}
                    <div className="flex-1 min-w-0">
                      {editingId === group.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm font-medium border-2 border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 bg-white"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(group.id);
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                          />
                          <button
                            onClick={() => handleSaveEdit(group.id)}
                            className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                            aria-label="Save"
                          >
                            <Check className="w-4 h-4 text-green-600" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                            aria-label="Cancel"
                          >
                            <X className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <h3 className="text-sm font-semibold text-slate-900 truncate">
                            {group.name}
                          </h3>
                          <p className="text-xs text-slate-500">
                            {group.tabCount} tabs •{" "}
                            {formatRelativeTime(group.timestamp)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Menu Button */}
                  {editingId !== group.id && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenu(activeMenu === group.id ? null : group.id)
                        }
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        aria-label="Group options"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-600" />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenu === group.id && (
                        <div className="absolute right-0 top-10 w-48 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-20 py-1 animate-in fade-in zoom-in-95">
                          <button
                            onClick={() => handleStartEdit(group)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                            Rename
                          </button>
                          <button
                            onClick={() => handleDuplicate(group)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleExport(group)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            Export
                          </button>
                          <div className="border-t border-slate-200 my-1" />
                          <button
                            onClick={() => handleDelete(group.id, group.name)}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Tab Preview */}
                <div className="space-y-1.5 mb-3">
                  {group.tabs.slice(0, 3).map((tab, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-2 py-1.5 truncate"
                      title={tab.title}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                      <span className="truncate flex-1">{tab.title}</span>
                    </div>
                  ))}
                  {group.tabCount > 3 && (
                    <p className="text-xs text-slate-400 px-2">
                      +{group.tabCount - 3} more tabs
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenGroup(group)}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all hover:shadow-md hover:shadow-violet-500/30 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Open Group
                  </button>
                  <button
                    onClick={() => handleOpenGroup(group)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-all hover:border-violet-300 active:scale-[0.98] flex items-center justify-center"
                    aria-label="Open tabs in background"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Click outside overlay for menu */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}