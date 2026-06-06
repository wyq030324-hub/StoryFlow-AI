import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { StoryProvider } from "./context/StoryContext.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <StoryProvider>
        <App />
      </StoryProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
