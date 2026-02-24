import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Today from "./pages/Today";
import Join from "./pages/Join";
import SwitchUser from "./pages/SwitchUser";
import Members from "./pages/Members";
import Freezer from "./pages/Freezer";
import Orders from "./pages/Orders";
import MEP from "./pages/MEP";
import Auth from "./pages/Auth";
import Kitchen from "./pages/Kitchen";
import { KitchenProvider } from "./store/kitchenStore";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <KitchenProvider>
      <HashRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/kitchen" element={<Kitchen />} />

          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/today" replace />} />
            <Route path="today" element={<Today />} />
            <Route path="freezer" element={<Freezer />} />
            <Route path="orders" element={<Orders />} />
            <Route path="mep" element={<MEP />} />
          </Route>

            <Route path="/join" element={<Join />} />
      <Route path="/members" element={<Members />} />  <Route path="/switch" element={<SwitchUser />} />

    <Route path="*" element={<Navigate to="/today" replace />} />
        </Routes>
      </HashRouter>
    </KitchenProvider>
  </React.StrictMode>
);
