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
} from "lucide-react";
import { getTabGroupsCount } from "../backend/storage";

interface LibraryPageProps {
  onOpenPopup: (page: "popup" | "library") => void;
}

interface TabGroup {
  id: string;
  name: string;
  tabCount: number;
  timestamp: string;
  color: string;
  tabs: Array<{
    title: string;
    url: string;
  }>;
}

// Mock data - replace with actual storage later
const mockGroups: TabGroup[] = [
  {
    id: "g1",
    name: "Work Research",
    tabCount: 5,
    timestamp: "2h ago",
    color: "blue",
    tabs: [
      { title: "React Docs", url: "https://react.dev" },
      { title: "TypeScript", url: "https://typescriptlang.org" },
      { title: "MDN", url: "https://developer.mozilla.org" },
    ],
  },
  {
    id: "g2",
    name: "Shopping List",
    tabCount: 3,
    timestamp: "5h ago",
    color: "purple",
    tabs: [
      { title: "Amazon", url: "https://amazon.com" },
      { title: "Best Buy", url: "https://bestbuy.com" },
    ],
  },
  {
    id: "g3",
    name: "Development",
    tabCount: 7,
    timestamp: "1d ago",
    color: "red",
    tabs: [
      { title: "GitHub", url: "https://github.com" },
      { title: "Stack Overflow", url: "https://stackoverflow.com" },
      { title: "VS Code Docs", url: "https://code.visualstudio.com" },
    ],
  },
  {
    id: "g4",
    name: "Weekend Travel Planning",
    tabCount: 12,
    timestamp: "2d ago",
    color: "green",
    tabs: [
      { title: "Google Maps", url: "https://maps.google.com" },
      { title: "Airbnb", url: "https://airbnb.com" },
    ],
  },
];

export default function LibraryPage({ onOpenPopup }: LibraryPageProps) {
  const [groups, setGroups] = useState<TabGroup[]>(mockGroups);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [groupCount, setGroupCount] = useState<number>(0);

  useEffect(() => {
    const fetchGroupCount = async () => {
      try {
        const count = await getTabGroupsCount();
        setGroupCount(count);
      } catch (error) {
        console.error("Error fetching group count:", error);
      }
    };

    fetchGroupCount();
    chrome.storage.onChanged.addListener(fetchGroupCount);

    return () => {
      chrome.storage.onChanged.removeListener(fetchGroupCount);
    };
  }, []);
  const handleStartEdit = (group: TabGroup) => {
    setEditingId(group.id);
    setEditingName(group.name);
    setActiveMenu(null);
  };

  const handleSaveEdit = (id: string) => {
    setGroups(
      groups.map((g) => (g.id === id ? { ...g, name: editingName } : g)),
    );
    setEditingId(null);
    setEditingName("");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this tab group?")) {
      setGroups(groups.filter((g) => g.id !== id));
    }
    setActiveMenu(null);
  };

  const handleDuplicate = (group: TabGroup) => {
    const newGroup = {
      ...group,
      id: `g${Date.now()}`,
      name: `${group.name} (Copy)`,
      timestamp: "Just now",
    };
    setGroups([newGroup, ...groups]);
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
    <div className="w-[360px] h-[500px] bg-white flex flex-col p-6 rounded-3xl border border-slate-200 overflow-hidden popup-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenPopup("popup")}
            className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-slate-700" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Tab Library
            </h1>
            <p className="text-sm text-slate-500">
              {groups.length} saved groups
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-xl bg-violet-50 text-violet-700 text-sm font-medium">
            {groupCount + " "} 
            Sessions
          </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2">
        <div className="space-y-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-2xl p-4 hover:border-violet-300 transition-all group"
            >
              {/* Group Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Color Badge */}
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getColorClasses(group.color)} flex-shrink-0 shadow-md`}
                  />

                  {/* Name (Editable) */}
                  <div className="flex-1 min-w-0">
                    {editingId === group.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm font-medium border-2 border-violet-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleSaveEdit(group.id);
                            if (e.key === "Escape") handleCancelEdit();
                          }}
                        />
                        <button
                          onClick={() => handleSaveEdit(group.id)}
                          className="p-1 hover:bg-green-100 rounded-lg transition-colors"
                        >
                          <Check className="w-4 h-4 text-green-600" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="p-1 hover:bg-red-100 rounded-lg transition-colors"
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
                          {group.tabCount} tabs • {group.timestamp}
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
                      className="p-2 hover:bg-slate-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="w-4 h-4 text-slate-600" />
                    </button>

                    {/* Dropdown Menu */}
                    {activeMenu === group.id && (
                      <div className="absolute right-0 top-10 w-48 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-10 py-1">
                        <button
                          onClick={() => handleStartEdit(group)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                        >
                          <Edit3 className="w-4 h-4" />
                          Rename
                        </button>
                        <button
                          onClick={() => handleDuplicate(group)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                        >
                          <Copy className="w-4 h-4" />
                          Duplicate
                        </button>
                        <button
                          onClick={() => {
                            /* TODO: Export functionality */
                            setActiveMenu(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                        >
                          <Download className="w-4 h-4" />
                          Export
                        </button>
                        <div className="border-t border-slate-200 my-1" />
                        <button
                          onClick={() => handleDelete(group.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-2 text-red-600"
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
                    className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 rounded-lg px-2 py-1.5"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
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
                <button className="flex-1 bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all hover:shadow-md hover:shadow-violet-500/30 flex items-center justify-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Open Group
                </button>
                <button className="px-4 py-2 bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-all hover:border-violet-300 flex items-center justify-center">
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {groups.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              No saved groups yet
            </h3>
            <p className="text-sm text-slate-500">
              Save your first tab group to get started
            </p>
          </div>
        )}
      </div>

      {/* Close Menu on Outside Click */}
      {activeMenu && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}
