import { createElement } from "react";
import { createRoot } from "react-dom/client";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("Root element not found!");
}
// Create Root and Render it
const root = createRoot(rootEl);
// createElement returns a javascript object
// <h1> <span>...</span> </h1>
const reactElement = createElement(
  "h1",
  null,
  createElement("span", null, "I'm inside the span."),
);
const plainhtmlElement = (
  <h1>
    <span>Here is the plain Html element!</span>
  </h1>
);

function TextAndImg() {
  return (
    <div className="container">
      <h1 className="header"> My text content </h1>
      <img id="reactLogo" src="/react.svg"></img>
    </div>
  );
}

// Very first custom React component!
function MainContent() {
  return <h1> React is great!</h1>;
}

// render takes a single argument
root.render(
  // element, props, children
  //reactElement,
  //plainhtmlElement,
  <div id="singleParentelement"> {/* The tag can be main */}
    <MainContent /> {/*This is how we call custom component*/}
    {plainhtmlElement} {/* The brackets allows us to navigate to Javascript*/}
    <TextAndImg />
  </div>,
);
