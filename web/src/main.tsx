import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App as AntApp, ConfigProvider } from "antd";
import App from "./App";
import { theme } from "./theme";
import { AuthProvider } from "./context/AuthContext";
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ConfigProvider theme={theme}>
      <AntApp>
        <MessageBridge>
          <AuthProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </AuthProvider>
        </MessageBridge>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>
);
