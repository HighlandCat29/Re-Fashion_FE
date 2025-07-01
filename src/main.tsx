import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { store } from "./store.ts";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import ReactGA from "react-ga4";
ReactGA.initialize("G-VFT2X5B6GN");
ReactGA.send("pageview");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <Toaster />
      <App />
    </Provider>
  </React.StrictMode>
);
