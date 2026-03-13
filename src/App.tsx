import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./store";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import GeneratePlan from "./pages/GeneratePlan";
import PlanView from "./pages/PlanView";
import PlansList from "./pages/PlansList";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="profile" element={<Profile />} />
            <Route path="generate" element={<GeneratePlan />} />
            <Route path="plans" element={<PlansList />} />
            <Route path="plans/:id" element={<PlanView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
