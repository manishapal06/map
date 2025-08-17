// 1) React + root render
import React from "react";
import { createRoot } from "react-dom/client";
// 2) Main app + global styles + leaflet css
import App from "./App";
import "./styles.css";
import "leaflet/dist/leaflet.css";

const root = createRoot(document.getElementById("root"));
root.render(<App />);
