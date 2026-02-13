interface SettingsPageProps {
  onOpenPopup: (page: "popup" | "settings") => void;
}

export default function SettingsPage({ onOpenPopup }: SettingsPageProps) {
  return (
    <div className="w-[360px] h-[500px] bg-white flex flex-col p-6 rounded-3xl border border-slate-200 overflow-hidden popup-fade-in">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>
      <p className="text-gray-600">
        Here you can configure your extension settings.
      </p>
      <button
        type="button"
        onClick={() => onOpenPopup("popup")}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Click Here to go back to Popup
      </button>
    </div>
  );
}
