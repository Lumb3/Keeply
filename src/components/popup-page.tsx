//import React from "react";

// PopupPage must receive a prop called navigate
interface Props {
  navigate: (page: "popup" | "library") => void;
}
export default function PopupPage({ navigate }: Props) {
  return (
    <div>
      <h1>Popup Page</h1>
      <button onClick={() => navigate("library")}>Go to LibraryPage</button>
    </div>
  );
}
