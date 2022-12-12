import React from "react";
import ReactDOM from "react-dom/client";
import App from ".";
import "./App.css";
import "./index.css";
import { AuthProvider } from "@asgardeo/auth-react";
import { TokenExchangePlugin } from "@asgardeo/token-exchange-plugin";
import config from "./config.json";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider config={config} plugin={TokenExchangePlugin.getInstance()}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
