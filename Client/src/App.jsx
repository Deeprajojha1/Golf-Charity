import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAppDispatch } from "./app/hooks";
import { fetchMe } from "./features/auth/authSlice";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Charity from "./pages/Charity";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";

export default function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  return (
    <>
      <Navbar />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 2500,
          style: { background: "#1c2133", color: "#eef0f6", border: "1px solid rgba(255,255,255,0.08)" },
        }}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/charities" element={<Charity />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}
