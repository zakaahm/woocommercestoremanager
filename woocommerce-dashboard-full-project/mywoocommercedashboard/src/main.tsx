import React from "react";
import ReactDOM from "react-dom/client";
import { CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

// 1️⃣ Maak QueryClient (singleton)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false
    }
  }
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* 2️⃣ React Query provider */}
    <QueryClientProvider client={queryClient}>
      {/* 3️⃣ Router */}
      <BrowserRouter>
        {/* 4️⃣ MUI baseline */}
        <CssBaseline />
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
