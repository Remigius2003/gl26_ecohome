import { render } from "solid-js/web";

import "solid-devtools";
import App from "./App";
import "./index.css";

const root = document.getElementById("root");
if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("SW registered"))
      .catch((err) => console.error("SW registration failed", err));
  });
}

render(() => <App></App>, root!);
