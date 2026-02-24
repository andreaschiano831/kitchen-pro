import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import "./index.css";

import AppLayout from "./layout/AppLayout";
import { KitchenProvider } from "./store/kitchenStore";

import Today from "./pages/Today";
import Freezer from "./pages/Freezer";
import Orders from "./pages/Orders";
import MEP from "./pages/MEP";
import Kitchen from "./pages/Kitchen";
import Members from "./pages/Members";
import Join from "./pages/Join";
import SwitchUser from "./pages/SwitchUser";
import Search from "./pages/Search";
import Capture from "./pages/Capture";
import Auth from "./pages/Auth";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <KitchenProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/today" replace />} />
            <Route path="/today" element={<Today />} />
            <Route path="/freezer" element={<Freezer />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/mep" element={<MEP />} />
            <Route path="/kitchen" element={<Kitchen />} />
            <Route path="/members" element={<Members />} />
            <Route path="/join" element={<Join />} />
            <Route path="/switch" element={<SwitchUser />} />
            <Route path="/search" element={<Search />} />
            <Route path="/capture" element={<Capture />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="*" element={<Navigate to="/today" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </KitchenProvider>
  </React.StrictMode>
);
