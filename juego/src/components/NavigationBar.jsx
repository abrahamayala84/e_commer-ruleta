import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

function NavigationBar({ user }) {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <nav className="navbar">
            <div className="logo">
                <Link to={user ? "/" : "/login"}>🎰 Ruleta App</Link>
            </div>
            <div className="nav-links">
                {user ? (
                    <>
                        <Link to="/">Inicio</Link>
                        <Link to="/canjear">🎁 Canjear</Link>
                        <Link
                            to="/gestion-productos"
                            className="btn-gestion-nav"
                        >
                            📦 Gestión
                        </Link>
                        <Link to="/perfil">Mi Perfil</Link>
                        <div className="user-info">
                            <span>
                                Hola, {user.email?.split("@")[0] || "Usuario"}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="logout-btn"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    </>
                ) : (
                    <Link to="/login">Iniciar sesión</Link>
                )}
            </div>
        </nav>
    );
}

export default NavigationBar;
