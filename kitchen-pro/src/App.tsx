import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./layout/AppShell";

import Dashboard from "./pages/Dashboard";
import Freezer from "./pages/Freezer";     // user module
import Orders from "./pages/Orders";
import MEP from "./pages/MEP";
import Members from "./pages/Members";
import Kitchen from "./pages/Kitchen";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/inventory" element={<Freezer />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/mep" element={<MEP />} />
        <Route path="/members" element={<Members />} />
        <Route path="/kitchen" element={<Kitchen />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
