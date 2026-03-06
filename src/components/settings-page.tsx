// settings-page.tsx
import {
  ArrowLeft,
  Download,
  Upload,
  Trash2,
  HardDrive,
  ToggleLeft,
  ToggleRight,
  Layers,
  Palette,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  getAllTabGroups,
  saveTabGroup,
  deleteTabGroup,
  type TabGroup,
} from "../backend/storage";

interface SettingsPageProps {
  onOpenPopup: (page: "popup" | "settings") => void;
}

interface AppSettings {
  autoCloseTabs: boolean;
  maxRecentSessions: number;
  defaultColor: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  autoCloseTabs: false,
  maxRecentSessions: 3,
  defaultColor: "blue",
};

const COLOR_OPTIONS = [
  { name: "blue", gradient: "from-blue-500 to-cyan-500" },
  { name: "purple", gradient: "from-purple-500 to-pink-500" },
  { name: "red", gradient: "from-red-500 to-orange-500" },
  { name: "green", gradient: "from-green-500 to-emerald-500" },
  { name: "yellow", gradient: "from-yellow-500 to-amber-500" },
  { name: "indigo", gradient: "from-indigo-500 to-violet-500" },
  { name: "cyan", gradient: "from-cyan-500 to-sky-500" },
  { name: "orange", gradient: "from-orange-500 to-amber-500" },
  { name: "pink", gradient: "from-pink-500 to-rose-500" },
  { name: "teal", gradient: "from-teal-500 to-emerald-500" },
];

type ToastType = "success" | "error";
interface Toast {
  message: string;
  type: ToastType;
}

export default function SettingsPage({ onOpenPopup }: SettingsPageProps) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [storageBytes, setStorageBytes] = useState<number>(0);
  const [storageQuota] = useState<number>(5 * 1024 * 1024); // 5MB
  const [toast, setToast] = useState<Toast | null>(null);
  const [clearConfirm, setClearConfirm] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 2800);
  };

  // Load settings and storage usage
  useEffect(() => {
    const load = async () => {
      try {
        const result = await chrome.storage.local.get(["appSettings"]);
        if (result.appSettings) {
          setSettings({ ...DEFAULT_SETTINGS, ...result.appSettings });
        }
        chrome.storage.local.getBytesInUse(null, (bytes) => {
          setStorageBytes(bytes);
        });
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    load();
  }, []);

  const saveSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await chrome.storage.local.set({ appSettings: updated });
  };

  // Export all
  const handleExportAll = async () => {
    try {
      const groups = await getAllTabGroups();
      if (groups.length === 0) {
        showToast("No sessions to export.", "error");
        return;
      }
      const blob = new Blob([JSON.stringify({ version: 1, groups }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `keeply-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast(`Exported ${groups.length} session(s).`, "success");
    } catch {
      showToast("Export failed. Please try again.", "error");
    }
  };

  // Import 
  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected
    e.target.value = "";

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      // Support both { version, groups } shape and a plain array
      const incoming: TabGroup[] = Array.isArray(parsed)
        ? parsed
        : parsed.groups ?? [];

      if (!Array.isArray(incoming) || incoming.length === 0) {
        showToast("No valid sessions found in file.", "error");
        return;
      }

      // Save each group (prepends to existing list)
      for (const group of [...incoming].reverse()) {
        await saveTabGroup({ ...group, id: crypto.randomUUID() });
      }

      // Refresh storage indicator
      chrome.storage.local.getBytesInUse(null, setStorageBytes);
      showToast(`Imported ${incoming.length} session(s).`, "success");
    } catch {
      showToast("Invalid backup file.", "error");
    }
  };

  // Clear all 
  const handleClearAll = async () => {
    try {
      const groups = await getAllTabGroups();
      await Promise.all(groups.map((g) => deleteTabGroup(g.id)));
      chrome.storage.local.getBytesInUse(null, setStorageBytes);
      setClearConfirm(false);
      showToast("All sessions cleared.", "success");
    } catch {
      showToast("Could not clear sessions.", "error");
    }
  };

  const storagePercent = Math.min((storageBytes / storageQuota) * 100, 100);
  const storageKB = (storageBytes / 1024).toFixed(1);
  const storageColor =
    storagePercent > 80
      ? "bg-red-500"
      : storagePercent > 50
        ? "bg-yellow-500"
        : "bg-violet-500";

  return (
    <div className="w-[360px] h-[500px] bg-white flex flex-col rounded-3xl border border-slate-200 overflow-hidden popup-fade-in relative">
      {/* Toast */}
      {toast && (
        <div
          className={`absolute top-3 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 py-2 rounded-xl shadow-lg text-white text-xs font-medium transition-all ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          ) : (
            <XCircle className="w-3.5 h-3.5 shrink-0" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
        <button
          onClick={() => onOpenPopup("popup")}
          className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all active:scale-95"
          aria-label="Go back"
        >
          <ArrowLeft className="w-4 h-4 text-slate-700" />
        </button>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
          <p className="text-xs text-slate-500">Customize your experience</p>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

        {/* Behaviour */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Behaviour
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl divide-y divide-slate-200">

            {/* Auto-close tabs */}
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex-1 min-w-0 mr-3">
                <p className="text-sm font-medium text-slate-800">
                  Auto-close tabs after saving
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Close tabs automatically when a group is saved
                </p>
              </div>
              <button
                onClick={() =>
                  saveSetting("autoCloseTabs", !settings.autoCloseTabs)
                }
                aria-label="Toggle auto-close"
                className="shrink-0"
              >
                {settings.autoCloseTabs ? (
                  <ToggleRight className="w-8 h-8 text-violet-600" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-slate-300" />
                )}
              </button>
            </div>

            {/* Max recent sessions */}
            <div className="flex items-center justify-between px-3 py-3">
              <div className="flex items-center gap-2 mr-3">
                <Layers className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-slate-800">
                    Recent sessions shown
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Visible on the main popup
                  </p>
                </div>
              </div>
              <div className="relative shrink-0">
                <select
                  value={settings.maxRecentSessions}
                  onChange={(e) =>
                    saveSetting("maxRecentSessions", Number(e.target.value))
                  }
                  className="appearance-none pl-3 pr-7 py-1.5 border-2 border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white focus:outline-none focus:border-violet-400"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Default colour */}
            <div className="px-3 py-3">
              <div className="flex items-center gap-2 mb-2">
                <Palette className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-800">
                  Default group colour
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(({ name, gradient }) => (
                  <button
                    key={name}
                    onClick={() => saveSetting("defaultColor", name)}
                    className={`w-6 h-6 rounded-full bg-gradient-to-br ${gradient} ring-2 ring-offset-1 transition-all ${
                      settings.defaultColor === name
                        ? "ring-slate-600 scale-110"
                        : "ring-transparent hover:scale-110"
                    }`}
                    aria-label={`Set default colour to ${name}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Data & Storage Section */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-2">
            Data &amp; Storage
          </p>
          <div className="bg-slate-50 border border-slate-200 rounded-2xl divide-y divide-slate-200">

            {/* Storage bar */}
            <div className="px-3 py-3">
              <div className="flex items-center gap-2 mb-2">
                <HardDrive className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-800">
                  Storage used
                </p>
                <span className="ml-auto text-xs text-slate-500">
                  {storageKB} KB / 5 120 KB
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${storageColor}`}
                  style={{ width: `${storagePercent}%` }}
                />
              </div>
            </div>

            {/* Export */}
            <button
              onClick={handleExportAll}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white transition-colors text-left"
            >
              <Download className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Export all sessions
                </p>
                <p className="text-xs text-slate-500">
                  Download a JSON backup of every group
                </p>
              </div>
            </button>

            {/* Import */}
            <button
              onClick={() => importRef.current?.click()}
              className="w-full flex items-center gap-3 px-3 py-3 hover:bg-white transition-colors text-left"
            >
              <Upload className="w-4 h-4 text-slate-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-slate-800">
                  Import sessions
                </p>
                <p className="text-xs text-slate-500">
                  Restore from a Keeply backup file
                </p>
              </div>
            </button>
            <input
              ref={importRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportFile}
            />

            {/* Clear all */}
            {clearConfirm ? (
              <div className="px-3 py-3 bg-red-50">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm font-semibold text-red-700">
                    Delete all sessions?
                  </p>
                </div>
                <p className="text-xs text-red-600 mb-3">
                  This cannot be undone. Consider exporting a backup first.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleClearAll}
                    className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Yes, delete all
                  </button>
                  <button
                    onClick={() => setClearConfirm(false)}
                    className="flex-1 py-1.5 border-2 border-slate-200 text-slate-700 text-xs font-semibold rounded-lg hover:border-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setClearConfirm(true)}
                className="w-full flex items-center gap-3 px-3 py-3 hover:bg-red-50 transition-colors text-left"
              >
                <Trash2 className="w-4 h-4 text-red-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-red-600">
                    Clear all sessions
                  </p>
                  <p className="text-xs text-slate-500">
                    Permanently delete every saved group
                  </p>
                </div>
              </button>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}