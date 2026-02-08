// App.tsx
import { useState } from "react";
import PopupPage from "./components/popup-page";
import LibraryPage from "./components/library-page";
import AddNewTabPage from "./components/add-tab-page";

export default function App() {
  // State to track which "page" we are showing
  const [page, setPage] = useState<"popup" | "library" | "addtab">("popup");

  // Function to swtich pages
  const navigate = (target: "popup" | "library" | "addtab") => {
    setPage(target);
  };

  return (
    <div>
      {page === "popup" && <PopupPage onTransitionPage={navigate} />}
      {page === "library" && <LibraryPage onOpenPopup={navigate} />}
      {page === "addtab" && <AddNewTabPage onOpenPopup={navigate} />}
    </div>
  );
}
