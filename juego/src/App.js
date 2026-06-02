import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import NavigationBar from "./components/NavigationBar";
import Login from "./pages/Login";
import Crear from "./pages/Crear";
import Dashboard from "./pages/Dashboard";
import Agregar from "./pages/Agregar";
import Ruleta from "./pages/Ruleta";
import Perfil from "./pages/Perfil";
import EditarNegocio from "./pages/EditarNegocio";
import Canjear from "./pages/Canjear";
import CatalogoNegocio from "./pages/CatalogoNegocio";
import GestionProductos from "./pages/GestionProductos";

function ProtectedRoute({ children, user }) {
    if (!user) {
        return <Navigate to="/login" replace />;
    }
    return children;
}

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [negocioId, setNegocioId] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) {
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100vh",
                    background: "linear-gradient(135deg, #1e1e2f, #2a2a40)",
                    color: "white",
                }}
            >
                <div style={{ textAlign: "center" }}>
                    <h2>🎰 Ruleta App</h2>
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <NavigationBar user={user} />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/crear" element={<Crear />} />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute user={user}>
                            <Dashboard setNegocioId={setNegocioId} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/agregar"
                    element={
                        <ProtectedRoute user={user}>
                            <Agregar />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/ruleta/:id"
                    element={
                        <ProtectedRoute user={user}>
                            <Ruleta setNegocioId={setNegocioId} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/perfil"
                    element={
                        <ProtectedRoute user={user}>
                            <Perfil />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/editar-negocio/:id"
                    element={
                        <ProtectedRoute user={user}>
                            <EditarNegocio />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/canjear"
                    element={
                        <ProtectedRoute user={user}>
                            <Canjear />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/catalogo-negocio/:id"
                    element={
                        <ProtectedRoute user={user}>
                            <CatalogoNegocio setNegocioId={setNegocioId} />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/gestion-productos"
                    element={
                        <ProtectedRoute user={user}>
                            <GestionProductos />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="*"
                    element={<Navigate to={user ? "/" : "/login"} replace />}
                />
            </Routes>
        </>
    );
}

export default App;
