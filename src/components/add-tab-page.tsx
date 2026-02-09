// add-tab-page.tsx
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Check,
  Globe,
  Save,
  CheckSquare,
  Square,
} from "lucide-react";
import { saveTabGroup } from "../backend/storage";

interface AddNewTabPageProps {
  onOpenPopup: (page: "popup" | "library" | "addtab") => void;
}

interface Tab {
  id: number;
  title: string;
  url: string;
  favIconUrl?: string;
  selected: boolean;
}

export default function AddNewTabPage({ onOpenPopup }: AddNewTabPageProps) {
  const [groupName, setGroupName] = useState("");
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch all open tabs on mount
  useEffect(() => {
    const fetchTabs = async () => {
      try {
        const chromeTabs = await chrome.tabs.query({ currentWindow: true });
        const tabsWithSelection = chromeTabs.map((tab) => ({
          id: tab.id!,
          title: tab.title || "Untitled",
          url: tab.url || "",
          favIconUrl: tab.favIconUrl,
          selected: true,
        }));
        setTabs(tabsWithSelection);
      } catch (error) {
        console.error("Error fetching tabs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTabs();
  }, []);

  const toggleTab = (id: number) => {
    setTabs(
      tabs.map((tab) =>
        tab.id === id ? { ...tab, selected: !tab.selected } : tab
      )
    );
  };

  const selectAll = () => {
    setTabs(tabs.map((tab) => ({ ...tab, selected: true })));
  };

  const deselectAll = () => {
    setTabs(tabs.map((tab) => ({ ...tab, selected: false })));
  };

  const selectedCount = tabs.filter((tab) => tab.selected).length;

  const handleSave = async () => {
    if (!groupName.trim()) {
      alert("Please enter a group name");
      return;
    }

    if (selectedCount === 0) {
      alert("Please select at least one tab");
      return;
    }

    setSaving(true);

    try {
      const selectedTabs = tabs.filter((tab) => tab.selected);

      const newGroup = {
        id: Date.now().toString(),
        name: groupName.trim(),
        tabs: selectedTabs.map((tab) => ({
          title: tab.title,
          url: tab.url,
          favicon: tab.favIconUrl,
        })),
        tabCount: selectedTabs.length,
        timestamp: new Date().toISOString(),
        color: ["blue", "purple", "red", "green", "yellow", "indigo"][
          Math.floor(Math.random() * 6)
        ],
      };

      // Save to chrome.storage.local
      await saveTabGroup(newGroup);

      // Ask to close tabs (optional)
      const shouldClose = confirm(
        "Tab group saved! Would you like to close these tabs?"
      );
      if (shouldClose) {
        const tabIds = selectedTabs.map((tab) => tab.id);
        await chrome.tabs.remove(tabIds);
      }

      // Return to popup
      onOpenPopup("popup");
    } catch (error) {
      console.error("Error saving tab group:", error);
      alert("Failed to save tab group. Please try again.");
    } finally {
      setSaving(false);
    }
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
              Save Tab Group
            </h1>
            <p className="text-sm text-slate-500">
              {selectedCount} of {tabs.length} tabs selected
            </p>
          </div>
        </div>
      </div>

      {/* Group Name Input */}
      <div className="mb-4 flex-shrink-0">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Group Name
        </label>
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder="e.g., Work Research, Shopping List"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-200 transition-all"
          autoFocus
        />
      </div>

      {/* Quick Selection Controls */}
      <div className="flex gap-2 mb-4 flex-shrink-0">
        <button
          onClick={selectAll}
          className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <CheckSquare className="w-4 h-4" />
          Select All
        </button>
        <button
          onClick={deselectAll}
          className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700 transition-colors flex items-center justify-center gap-2"
        >
          <Square className="w-4 h-4" />
          Deselect All
        </button>
      </div>

      {/* Tabs List */}
      <div className="flex-1 overflow-y-auto -mx-2 px-2 mb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-slate-400">Loading tabs...</div>
          </div>
        ) : (
          <div className="space-y-2">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                onClick={() => toggleTab(tab.id)}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  tab.selected
                    ? "bg-violet-50 border-violet-300 hover:border-violet-400"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                {/* Checkbox */}
                <div className="flex-shrink-0 mt-0.5">
                  <div
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      tab.selected
                        ? "bg-violet-600 border-violet-600"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    {tab.selected && (
                      <Check className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                </div>

                {/* Favicon */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden">
                  {tab.favIconUrl ? (
                    <img
                      src={tab.favIconUrl}
                      alt=""
                      className="w-5 h-5"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <Globe className="w-4 h-4 text-slate-400" />
                  )}
                </div>

                {/* Tab Info */}
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-sm font-medium truncate ${
                      tab.selected ? "text-slate-900" : "text-slate-700"
                    }`}
                  >
                    {tab.title}
                  </h4>
                  <p
                    className={`text-xs truncate ${
                      tab.selected ? "text-slate-600" : "text-slate-500"
                    }`}
                  >
                    {tab.url}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={selectedCount === 0 || !groupName.trim() || saving}
        className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl px-6 py-4 font-bold transition-all hover:shadow-lg hover:shadow-violet-500/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
      >
        <Save className="w-5 h-5" />
        {saving
          ? "Saving..."
          : `Save ${selectedCount} ${selectedCount === 1 ? "Tab" : "Tabs"}`}
      </button>
    </div>
  );
}