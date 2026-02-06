// popup-page.tsx
import { Layers, Search, FolderOpen, RotateCcw } from "lucide-react";
import "../popup-animation.css";

// Props for the LibraryPage
interface LibraryPageProps {
  onOpenLibrary: (page: "popup" | "library") => void;
}

export default function LibraryPage({ onOpenLibrary }: LibraryPageProps) {
  return (
    <div className="w-[360px] h-[500px] bg-white flex flex-col p-6 rounded-3xl popup-fade-in">
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
      <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl p-5 mb-4 border border-violet-200/50 flex-shrink-0">
        <h2 className="text-sm font-medium text-slate-600 mb-3">
          Current Session
        </h2>
        <div className="flex gap-6">
          <div>
            <div className="text-3xl font-bold text-violet-600">12</div>
            <div className="text-xs text-slate-600 mt-1">Open Tabs</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-indigo-600">8</div>
            <div className="text-xs text-slate-600 mt-1">Saved Groups</div>
          </div>
        </div>
      </div>

      {/* Primary Action */}
      <button
        type="button"
        className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 hover:from-violet-600 hover:to-indigo-700 text-white rounded-xl px-6 py-4 font-medium transition-all hover:shadow-lg hover:shadow-violet-500/30 flex items-center justify-center gap-2 mb-3 flex-shrink-0"
      >
        <RotateCcw className="w-5 h-5" />
        Save Current Session
      </button>

      {/* Secondary Actions */}
      <div className="grid grid-cols-2 gap-3 mb-4 flex-shrink-0">
        <button
          type="button"
          onClick={() => onOpenLibrary("library")}
          className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 transition-all hover:border-violet-300 flex items-center justify-center gap-2"
        >
          <FolderOpen className="w-4 h-4" />
          Open Library
        </button>
        <button
          type="button"
          className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 font-medium text-slate-700 transition-all hover:border-violet-300 flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>

      {/* Recent Sessions List - Scrollable area */}
      <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-2">
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
            Recent Sessions
          </h3>

          {/* Example session items */}
          <div className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl p-3 hover:border-violet-300 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-700">
                Work Research
              </h4>
              <span className="text-xs text-slate-400">2h ago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded bg-blue-100 border-2 border-white"></div>
                <div className="w-5 h-5 rounded bg-green-100 border-2 border-white"></div>
                <div className="w-5 h-5 rounded bg-orange-100 border-2 border-white"></div>
              </div>
              <span className="text-xs text-slate-500">5 tabs</span>
            </div>
          </div>

          <div className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl p-3 hover:border-violet-300 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-700">
                Shopping List
              </h4>
              <span className="text-xs text-slate-400">5h ago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded bg-purple-100 border-2 border-white"></div>
                <div className="w-5 h-5 rounded bg-pink-100 border-2 border-white"></div>
              </div>
              <span className="text-xs text-slate-500">3 tabs</span>
            </div>
          </div>

          <div className="bg-white hover:bg-slate-50 border-2 border-slate-200 rounded-xl p-3 hover:border-violet-300 transition-all cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-medium text-slate-700">
                Development
              </h4>
              <span className="text-xs text-slate-400">1d ago</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-5 h-5 rounded bg-red-100 border-2 border-white"></div>
                <div className="w-5 h-5 rounded bg-yellow-100 border-2 border-white"></div>
                <div className="w-5 h-5 rounded bg-cyan-100 border-2 border-white"></div>
                <div className="w-5 h-5 rounded bg-teal-100 border-2 border-white"></div>
              </div>
              <span className="text-xs text-slate-500">7 tabs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
