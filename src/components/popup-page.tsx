// popup-page.tsx
import { Layers, Plus, Trash2, Settings, SquarePen } from "lucide-react"; // Changed RotateCcw to Plus
import { useState, useEffect } from "react";
import {
  getRecentTabGroups,
  getTabGroupsCount,
  formatRelativeTime,
  deleteTabGroup,
  type TabGroup,
} from "../backend/storage";
import "../popup-animation.css";

interface PageTransitionProps {
  onTransitionPage: (page: "popup" | "library" | "addtab" | "settings") => void;
}

export default function PopupPage({ onTransitionPage }: PageTransitionProps) {
  const [tabCount, setTabCount] = useState<number>(0);
  const [savedGroupsCount, setGroupCount] = useState<number>(0);
  const [recentGroups, setRecentGroups] = useState<TabGroup[]>([]);

  useEffect(() => {
    const fetchTabCount = async () => {
      try {
        const tabs = await chrome.tabs.query({});
        setTabCount(tabs.length);
      } catch (error) {
        console.error("Error fetching tab count:", error);
      }
    };

    fetchTabCount();

    const handleTabChange = () => fetchTabCount();
    chrome.tabs.onCreated.addListener(handleTabChange);
    chrome.tabs.onRemoved.addListener(handleTabChange);

    return () => {
      chrome.tabs.onCreated.removeListener(handleTabChange);
      chrome.tabs.onRemoved.removeListener(handleTabChange);
    };
  }, []);

  useEffect(() => {
    const fetchSavedGroups = async () => {
      try {
        const count = await getTabGroupsCount();
        const recent = await getRecentTabGroups(3);
        setGroupCount(count);
        setRecentGroups(recent);
      } catch (error) {
        console.error("Error fetching saved sessions:", error);
      }
    };

    fetchSavedGroups();

    const handleStorageChange = () => fetchSavedGroups();
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: "bg-blue-100",
      purple: "bg-purple-100",
      red: "bg-red-100",
      green: "bg-green-100",
      yellow: "bg-yellow-100",
      indigo: "bg-indigo-100",
      cyan: "bg-cyan-100",
      orange: "bg-orange-100",
      pink: "bg-pink-100",
      teal: "bg-teal-100",
    };
    return colors[color] || colors.blue;
  };

  const handleOpenGroup = async (group: TabGroup) => {
    try {
      for (const tab of group.tabs) {
        await chrome.tabs.create({ url: tab.url, active: false });
      }
      const tabs = await chrome.tabs.query({ currentWindow: true });
      if (tabs.length > 0) {
        await chrome.tabs.update(tabs[tabs.length - group.tabs.length].id!, {
          active: true,
        });
      }
    } catch (error) {
      console.error("Error opening tab group:", error);
    }
  };

  const handleDeleteGroup = async (
    e: React.MouseEvent,
    groupId: string,
    groupName: string,
  ) => {
    e.stopPropagation();

    const confirmed = confirm(
      `Are you sure you want to delete "${groupName}"?`,
    );

    if (confirmed) {
      try {
        await deleteTabGroup(groupId);
      } catch (error) {
        console.error("Error deleting tab group:", error);
        alert("Failed to delete group. Please try again.");
      }
    }
  };

  return (
    <div className="w-[360px] h-[500px] bg-white flex flex-col p-6 rounded-3xl border border-slate-200 overflow-hidden popup-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-shrink-0">
        <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shadow-md">
          <Layers className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Keeply</h1>
          <p className="text-sm text-slate-500">Manage your browser sessions</p>
        </div>
      </div>

      {/* Session Summary */}
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-4 mb-3 border border-violet-200/50 flex-shrink-0">
        <h2 className="text-xs font-medium text-slate-600 mb-2">
          Current Session
        </h2>
        <div className="flex gap-6">
          <div>
            <div className="text-3xl font-bold text-violet-600">{tabCount}</div>
            <div className="text-xs text-slate-600 mt-0.5">Open Tabs</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600">
              {savedGroupsCount}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">Saved Sessions</div>
          </div>
        </div>
      </div>

      {/* Add New Group Button - FIXED ICON: Replaced RotateCcw with Plus */}
      <button
        type="button"
        className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl px-6 py-4 font-bold transition-all hover:shadow-lg hover:shadow-violet-500/30 active:scale-[0.98] flex items-center justify-center gap-2 mb-3 flex-shrink-0"
        onClick={() => onTransitionPage("addtab")}
      >
        <Plus className="w-5 h-5" /> {/* Changed from RotateCcw */}
        Add a new tab group
      </button>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-2 mb-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => onTransitionPage("library")}
          className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 text-sm transition-all hover:border-violet-300 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <SquarePen className="w-4 h-4" />
          Edit Sessions
        </button>
        <button
          type="button"
          onClick={() => onTransitionPage("settings")}
          className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 font-bold text-slate-700 text-sm transition-all hover:border-violet-300 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Recent Sessions List */}
      <div className="flex-1 overflow-y-auto -mx-5 px-5 pb-2 min-h-0">
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">
            Recent Sessions
          </h3>

          {recentGroups.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-slate-400">No saved groups yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Click "Add a new tab group" to get started
              </p>
            </div>
          ) : (
            <>
              {recentGroups.map((group) => (
                <div
                  key={group.id}
                  onClick={() => handleOpenGroup(group)}
                  className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl p-3 hover:border-violet-300 transition-all cursor-pointer group relative"
                >
                  <button
                    onClick={(e) => handleDeleteGroup(e, group.id, group.name)}
                    className="group/btn absolute bottom-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-slate-200 shadow-sm hover:shadow-md hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 z-10"
                    aria-label={`Delete group "${group.name}"`} // Added for accessibility
                  >
                    <Trash2 className="w-3.5 h-3.5 text-slate-500 group-hover/btn:text-red-600 transition-colors" />
                  </button>

                  <div className="flex items-start justify-between mb-1.5">
                    <h4 className="text-sm font-medium text-slate-700">
                      {group.name}
                    </h4>
                    <span className="text-xs text-slate-400 ml-2 flex-shrink-0">
                      {formatRelativeTime(group.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {group.tabs.slice(0, 4).map((_, idx) => (
                        <div
                          key={idx}
                          className={`w-4 h-4 rounded ${getColorClasses(group.color)} border-2 border-white`}
                        ></div>
                      ))}
                    </div>
                    <span className="text-xs text-slate-500">
                      {group.tabCount} tabs
                    </span>
                  </div>
                </div>
              ))}
              {/* View all hint */}
              <p className="text-center text-xs text-slate-400 pt-1 pb-1">
                Showing your 3 most recent —{" "}
                <button
                  type="button"
                  onClick={() => onTransitionPage("library")}
                  className="text-violet-500 hover:text-violet-700 font-medium underline underline-offset-2 transition-colors"
                >
                  Edit Sessions
                </button>{" "}
                to view all
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
