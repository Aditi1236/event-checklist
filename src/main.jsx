import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { EventsProvider } from "./context/EventsContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <EventsProvider>
          <App />
        </EventsProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>
);
