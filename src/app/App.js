import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "@/shared/context/AuthContext";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import AppRouter from "./router/AppRouter";

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppRouter />
          <Toaster />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
