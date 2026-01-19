import { Routes, Route, Navigate } from "react-router-dom";
import {Box } from "@mui/material";

import Dashboard from "../pages/Dashboard";
import Settings from "../pages/Settings";
import OnboardingPage from "../pages/onboarding";
import { ProductList,} from "../pages/Products";
import ImportCSV from "../features/import-csv/ImportCSV";
import Topbar from "../components/layout/Topbar";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../auth/auth-provider";
import EditProduct from "../pages/Products/edit/edit";
import AddProduct from "../pages/Products/add/add";

export default function AppRoutes() {
  const { auth } = useAuth();

  // 🔐 Niet ingelogd → onboarding
  if (!auth) {
    return (
      <Routes>
        <Route path="*" element={<OnboardingPage />} />
      </Routes>
    );
  }

  // ✅ Ingelogd → dashboard layout
  return (
    <>
      <Topbar />
      <Box display="flex">
        <Sidebar />
        <Box component="main" flexGrow={1} p={3}>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<AddProduct />} />
            <Route path="/products/:id/edit" element={<EditProduct />} /> {/* ✅ fix */}
            <Route path="/import" element={<ImportCSV />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>

        </Box>
      </Box>
    </>
  );
}
