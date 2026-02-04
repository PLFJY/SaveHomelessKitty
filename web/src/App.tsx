import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import RequireAuth from "./components/common/RequireAuth";
import Dashboard from "./pages/Dashboard";
import CatList from "./pages/Cats/CatList";
import CatDetail from "./pages/Cats/CatDetail";
import DeviceList from "./pages/Devices/DeviceList";
import DeviceDetail from "./pages/Devices/DeviceDetail";
import FeedLogs from "./pages/Logs/FeedLogs";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import AccessControl from "./pages/AccessControl";

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="cats" element={<CatList />} />
        <Route path="cats/:id" element={<CatDetail />} />
        <Route path="devices" element={<DeviceList />} />
        <Route path="devices/:id" element={<DeviceDetail />} />
        <Route path="logs" element={<FeedLogs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="access" element={<AccessControl />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
