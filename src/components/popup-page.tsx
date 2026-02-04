// popup-page.tsx
import { Bookmark } from "lucide-react";

// Props for the LibraryPage
interface LibraryPageProps {
  onOpenLibrary: (page: "popup" | "library") => void;
}

export default function LibraryPage({ onOpenLibrary }: LibraryPageProps) {
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-3xl shadow-2xl p-6 border border-slate-200/50">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center shadow-md">
          <Bookmark className="w-6 h-6 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Keeply</h1>
          <p className="text-sm text-slate-500">Manage your browser sessions</p>
        </div>
      </div>

      {/* Navigation Button */}
      <button
        onClick={() => onOpenLibrary("library")}
        className="px-4 py-2 rounded-lg bg-violet-500 text-white hover:bg-violet-600 transition-colors"
      >
        Back to Library
      </button>
    </div>
  );
}
