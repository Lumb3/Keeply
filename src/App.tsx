// App.tsx
import { useState } from "react";
import PopupPage from "./components/popup-page";
import LibraryPage from "./components/library-page";
import AddNewTabPage from "./components/add-tab-page";
import SettingsPage from "./components/settings-page";

export default function App() {
  // State to track which "page" we are showing
  const [page, setPage] = useState<"popup" | "library" | "addtab" | "settings">(
    "popup",
  );

  // Function to swtich pages
  const navigate = (target: "popup" | "library" | "addtab" | "settings") => {
    setPage(target);
  };

  return (
    <div>
      {page === "popup" && <PopupPage onTransitionPage={navigate} />}
      {page === "library" && <LibraryPage onOpenPopup={navigate} />}
      {page === "addtab" && <AddNewTabPage onOpenPopup={navigate} />}
      {page === "settings" && <SettingsPage onOpenPopup={navigate} />}
    </div>
  );
}
