
interface SettingsPageProps {
  onOpenPopup: (page: "popup" | "settings") => void;
}

export default function SettingsPage({ onOpenPopup }: SettingsPageProps) {
    return (
        <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <p className="text-gray-600">Here you can configure your extension settings.</p>
        {/* Add your settings options here */}
        </div>
    );
}