import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/shared/context/AuthContext";
import Layout from "@/components/layout/Layout";
import PopupManager from "@/components/common/Popup/PopupManager";
import { ALL_ROUTES } from "./routes";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/user/login" replace />;
}

export default function AppRouter() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PopupManager />
      <Routes>
        {ALL_ROUTES.map(({ path, element, layout = true, protected: isProtected }, idx) => {
          const content = isProtected ? (
            <ProtectedRoute>{element}</ProtectedRoute>
          ) : (
            element
          );

          return (
            <Route
              key={idx}
              path={path}
              element={layout ? <Layout>{content}</Layout> : content}
            />
          );
        })}
      </Routes>
    </>
  );
}
