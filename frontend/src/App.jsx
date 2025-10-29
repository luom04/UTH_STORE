// src/App.jsx
import React, { useEffect, useState } from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "react-hot-toast";

import { AuthProvider } from "./contexts/AuthContext.jsx";
import { CartProvider } from "./components/Cart/CartContext";
import AppRoutes from "./routes/AppRoutes.jsx";
import FullPageLoader from "./components/Common/FullPageLoader.jsx";

// Tạo 1 queryClient duy nhất ở scope module (tránh recreates)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* toast + devtools để trong QueryClientProvider cho tiện */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { background: "#363636", color: "#fff" },
          success: { iconTheme: { primary: "#10b981", secondary: "#fff" } },
          error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
        }}
      />
      <ReactQueryDevtools initialIsOpen={false} />

      <AnimatePresence>{isInitializing && <FullPageLoader />}</AnimatePresence>

      {!isInitializing && (
        <AuthProvider>
          <CartProvider>
            <Router>
              <AppRoutes />
            </Router>
          </CartProvider>
        </AuthProvider>
      )}
    </QueryClientProvider>
  );
}
