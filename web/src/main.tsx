import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App as AntApp, ConfigProvider } from "antd";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider, useThemeSettings } from "./context/ThemeContext";
import { I18nProvider } from "./context/I18nContext";
import { setMessageApi } from "./utils/notifications";
import "antd/dist/reset.css";
import "./styles/global.css";

const MessageBridge: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { message } = AntApp.useApp();

  React.useEffect(() => {
    setMessageApi(message);
  }, [message]);

  return <>{children}</>;
};

const ThemeBridge: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { themeConfig } = useThemeSettings();
  return <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>;
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <ThemeBridge>
          <AntApp>
            <MessageBridge>
              <AuthProvider>
                <BrowserRouter>
                  <App />
                </BrowserRouter>
              </AuthProvider>
            </MessageBridge>
          </AntApp>
        </ThemeBridge>
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>
);
