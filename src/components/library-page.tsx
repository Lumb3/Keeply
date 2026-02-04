// library-page.tsx
//import React from "react";
interface PopupNewWindow {
  onOpenPopup: (page: "popup" | "library") => void;
}

export default function LibraryPage({ onOpenPopup }: PopupNewWindow) {
  return (
    <div>
      <h1>Library</h1>
      <button onClick={() => onOpenPopup("popup")}>Back to Popup</button>
    </div>
  );
}
