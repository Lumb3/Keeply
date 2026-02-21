import { useEffect, useMemo, useState } from "react";
import {
  XCircle,
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
  CheckSquare,
  Square,
  SlidersHorizontal,
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

type SortBy = "recent" | "name" | "tabs";

const COLOR_OPTIONS = [
  "blue",
  "purple",
  "red",
  "green",
  "yellow",
  "indigo",
  "cyan",
  "orange",
  "pink",
  "teal",
];

export default function LibraryPage({ onOpenPopup }: LibraryPageProps) {
  const [groups, setGroups] = useState<TabGroup[]>([]);
  const [groupCount, setGroupCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [manageMode, setManageMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [fetchedGroups, count] = await Promise.all([
        getAllTabGroups(),
        getTabGroupsCount(),
      ]);
      setGroups(fetchedGroups);
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
    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  useEffect(() => {
    if (!manageMode) setSelectedIds(new Set());
  }, [manageMode]);

  const filteredGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const filtered = !q
      ? [...groups]
      : groups.filter(
          (g) =>
            g.name.toLowerCase().includes(q) ||
            g.tabs.some((t) => t.title?.toLowerCase().includes(q)),
        );

    filtered.sort((a, b) => {
      if (sortBy === "recent") return b.timestamp.localeCompare(a.timestamp);
      if (sortBy === "name") return a.name.localeCompare(b.name);
      return b.tabCount - a.tabCount;
    });

    return filtered;
  }, [groups, searchQuery, sortBy]);

  const selectedCount = selectedIds.size;

  const toggleSelected = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllVisible = () => {
    const allVisible = filteredGroups.every((g) => selectedIds.has(g.id));
    if (allVisible) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGroups.map((g) => g.id)));
    }
  };

  const handleStartEdit = (group: TabGroup) => {
    setEditingId(group.id);
    setEditingName(group.name);
    setActiveMenu(null);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    try {
      const groupToUpdate = groups.find((g) => g.id === id);
      if (!groupToUpdate) return;
      await updateTabGroup({ ...groupToUpdate, name: editingName.trim() });
      setEditingId(null);
      setEditingName("");
    } catch (error) {
      console.error("Error renaming group:", error);
      alert("Failed to rename group. Please try again.");
    }
  };

  const handleUpdateColor = async (group: TabGroup, color: string) => {
    try {
      await updateTabGroup({ ...group, color });
      setActiveMenu(null);
    } catch (error) {
      console.error("Error updating color:", error);
      alert("Failed to update color.");
    }
  };

  const handleRemoveTabFromGroup = async (
    group: TabGroup,
    tabIndex: number,
  ) => {
    try {
      const updatedTabs = group.tabs.filter((_, idx) => idx !== tabIndex);

      // If no tabs remain, delete the whole group
      if (updatedTabs.length === 0) {
        await deleteTabGroup(group.id);
        return;
      }

      const updatedGroup: TabGroup = {
        ...group,
        tabs: updatedTabs,
        tabCount: updatedTabs.length,
      };

      await updateTabGroup(updatedGroup);
    } catch (error) {
      console.error("Error removing tab from group:", error);
      alert("Failed to remove tab. Please try again.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteTabGroup(id);
      setActiveMenu(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Failed to delete group.");
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} selected group(s)?`)) return;

    try {
      await Promise.all(
        Array.from(selectedIds).map((id) => deleteTabGroup(id)),
      );
      setSelectedIds(new Set());
    } catch (error) {
      console.error("Error deleting selected groups:", error);
      alert("Some groups could not be deleted.");
    }
  };

  const handleDuplicate = async (group: TabGroup) => {
    try {
      const { id, timestamp, ...rest } = group;
      await saveTabGroup({
        ...(rest as Omit<TabGroup, "id" | "timestamp">),
        name: `${group.name} (Copy)`,
      } as TabGroup);
      setActiveMenu(null);
    } catch (error) {
      console.error("Error duplicating group:", error);
      alert("Failed to duplicate group.");
    }
  };

  const handleOpenGroup = async (group: TabGroup, firstActive = true) => {
    try {
      for (const tab of group.tabs) {
        await chrome.tabs.create({ url: tab.url, active: false });
      }
      if (firstActive) {
        const tabs = await chrome.tabs.query({ currentWindow: true });
        if (tabs.length > 0) {
          await chrome.tabs.update(tabs[tabs.length - group.tabs.length].id!, {
            active: true,
          });
        }
      }
    } catch (error) {
      console.error("Error opening group:", error);
      alert("Failed to open tabs.");
    }
  };

  const handleOpenSelected = async () => {
    const selectedGroups = groups.filter((g) => selectedIds.has(g.id));
    for (let i = 0; i < selectedGroups.length; i++) {
      await handleOpenGroup(selectedGroups[i], i === 0);
    }
  };

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
      cyan: "from-cyan-500 to-sky-500",
      orange: "from-orange-500 to-amber-500",
      pink: "from-pink-500 to-rose-500",
      teal: "from-teal-500 to-emerald-500",
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="w-[360px] h-[500px] bg-white flex flex-col p-4 rounded-3xl border border-slate-200 overflow-hidden popup-fade-in relative">
      <div className="mb-3 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenPopup("popup")}
              className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all active:scale-95"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4 text-slate-700" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Tab Library
              </h1>
              <p className="text-xs text-slate-500">
                {groupCount} saved sessions
              </p>
            </div>
          </div>
          <button
            onClick={() => setManageMode((v) => !v)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              manageMode
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-white text-slate-700 border-slate-200 hover:border-violet-300"
            }`}
          >
            Manage
          </button>
        </div>

        <div className="flex gap-2 mb-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search sessions or tabs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-300"
            />
          </div>
          <div className="relative">
            <SlidersHorizontal className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="appearance-none pl-7 pr-7 py-2 border-2 border-slate-200 rounded-xl text-xs font-medium text-slate-700 bg-white focus:outline-none focus:border-violet-300"
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="tabs">Tabs</option>
            </select>
          </div>
        </div>

        {manageMode && (
          <div className="flex items-center justify-between gap-2 mt-2">
            <button
              onClick={toggleSelectAllVisible}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 hover:border-violet-300 text-slate-700"
            >
              {filteredGroups.every((g) => selectedIds.has(g.id))
                ? "Clear all"
                : "Select all"}
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleOpenSelected}
                disabled={selectedCount === 0}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-violet-600 text-white disabled:opacity-40"
              >
                Open ({selectedCount})
              </button>
              <button
                onClick={handleDeleteSelected}
                disabled={selectedCount === 0}
                className="text-xs px-2.5 py-1.5 rounded-lg bg-red-600 text-white disabled:opacity-40"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto -mx-1 px-1">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 rounded-2xl bg-slate-100 animate-pulse"
              />
            ))}
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-500">
              {searchQuery ? "No matching groups" : "No saved groups yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 pb-1">
            {filteredGroups.map((group) => (
              <div
                key={group.id}
                className="bg-white border-2 border-slate-200 rounded-2xl p-3 hover:border-violet-300 transition-colors relative"
              >
                <div className="flex items-start gap-2">
                  {manageMode && (
                    <button
                      onClick={() => toggleSelected(group.id)}
                      className="mt-0.5 text-slate-600"
                      aria-label={`Select ${group.name}`}
                    >
                      {selectedIds.has(group.id) ? (
                        <CheckSquare className="w-4 h-4 text-violet-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  )}

                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getColorClasses(group.color)} shadow-sm`}
                  />

                  <div className="flex-1 min-w-0">
                    {editingId === group.id ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(group.id);
                            if (e.key === "Escape") {
                              setEditingId(null);
                              setEditingName("");
                            }
                          }}
                          className="flex-1 px-2 py-1 text-sm border-2 border-violet-400 rounded-lg focus:outline-none"
                        />
                        <button
                          onClick={() => handleSaveEdit(group.id)}
                          aria-label="Save"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(null);
                            setEditingName("");
                          }}
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

                    <div className="mt-2 space-y-1">
                      {group.tabs
                        .slice(0, manageMode ? group.tabs.length : 2)
                        .map((tab, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-md px-2 py-1"
                            title={tab.title || tab.url}
                          >
                            <span className="truncate flex-1">
                              {tab.title || tab.url}
                            </span>

                            {manageMode && (
                              <button
                                onClick={() =>
                                  handleRemoveTabFromGroup(group, i)
                                }
                                className="p-0.5 rounded hover:bg-red-100 text-slate-400 hover:text-red-600"
                                aria-label={`Remove tab ${tab.title || tab.url}`}
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        ))}

                      {!manageMode && group.tabCount > 2 && (
                        <p className="text-[11px] text-slate-400 px-1">
                          +{group.tabCount - 2} more tabs
                        </p>
                      )}
                    </div>
                  </div>

                  {editingId !== group.id && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === group.id ? null : group.id,
                          )
                        }
                        className="p-1.5 rounded-lg hover:bg-slate-100"
                        aria-label="Group options"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-600" />
                      </button>

                      {activeMenu === group.id && (
                        <div className="absolute right-0 top-9 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1">
                          <button
                            onClick={() => handleStartEdit(group)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Edit3 className="w-4 h-4" />
                            Rename
                          </button>
                          <button
                            onClick={() => handleDuplicate(group)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Duplicate
                          </button>
                          <button
                            onClick={() => handleExport(group)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Export
                          </button>
                          <div className="px-3 py-1.5">
                            <p className="text-[11px] text-slate-400 mb-1">
                              Color
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {COLOR_OPTIONS.map((color) => (
                                <button
                                  key={color}
                                  onClick={() =>
                                    handleUpdateColor(group, color)
                                  }
                                  className={`w-4 h-4 rounded-full bg-gradient-to-br ${getColorClasses(
                                    color,
                                  )} ring-2 ${group.color === color ? "ring-slate-500" : "ring-transparent"}`}
                                  aria-label={`Set ${color}`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="border-t border-slate-200 my-1" />
                          <button
                            onClick={() => handleDelete(group.id, group.name)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!manageMode && (
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleOpenGroup(group, true)}
                      className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-lg px-3 py-2 text-sm font-medium flex items-center justify-center gap-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Open Group
                    </button>
                    <button
                      onClick={() => handleOpenGroup(group, false)}
                      className="px-3 py-2 border-2 border-slate-200 rounded-lg text-slate-700 hover:border-violet-300"
                      aria-label="Open in background"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {activeMenu && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}
