import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import { updateProfile } from "firebase/auth";

function Perfil() {
    const [user, setUser] = useState(null);
    const [displayName, setDisplayName] = useState("");
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");

    useEffect(() => {
        const currentUser = auth.currentUser;
        setUser(currentUser);
        setDisplayName(currentUser?.displayName || "");
        setLoading(false);
    }, []);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(auth.currentUser, {
                displayName: displayName,
            });
            setMessage("Perfil actualizado correctamente");
            setTimeout(() => setMessage(""), 3000);
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            setMessage("Error al actualizar perfil");
        }
    };

    if (loading) return <div className="form-container">Cargando...</div>;

    return (
        <div className="form-container">
            <h2>Mi Perfil</h2>
            {message && (
                <p style={{ color: "#4ade80", textAlign: "center" }}>
                    {message}
                </p>
            )}
            <form onSubmit={handleUpdateProfile}>
                <div className="form-group">
                    <label>Correo electrónico</label>
                    <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        style={{ opacity: 0.7 }}
                    />
                </div>
                <div className="form-group">
                    <label>Nombre de usuario</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Tu nombre"
                    />
                </div>
                <button type="submit" className="btn-primary">
                    Actualizar Perfil
                </button>
            </form>
        </div>
    );
}

export default Perfil; // ✅ Exportación default
