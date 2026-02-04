// library-page.tsx
//import React from "react";
interface Props {
  navigate: (page: "popup" | "library") => void;
}

export default function LibraryPage({ navigate }: Props) {
  return (
    <div>
      <h1>Library</h1>
      <button onClick={() => navigate("popup")}>Back to Popup</button>
    </div>
  );
}
