// App.tsx
import { useState } from "react";
import PopupPage from "./components/popup-page";
import LibraryPage from "./components/library-page";

export default function App() {
  // State to track which "page" we are showing
  const [page, setPage] = useState<"popup" | "library">("popup");

  // Function to swtich pages
  const navigate = (target: "popup" | "library") => {
    setPage(target);
  };

  return (
    <div>
      {page === "popup" && <PopupPage navigate={navigate} />}
      {page === "library" && <LibraryPage navigate={navigate} />}
    </div>
  );
}
