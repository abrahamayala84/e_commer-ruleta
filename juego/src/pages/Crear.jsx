import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

function Crear() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (password !== confirm) {
            setError("Las contraseñas no coinciden");
            return;
        }
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            navigate("/login"); // Redirige al login después del registro
        } catch (err) {
            if (err.code === "auth/email-already-in-use") {
                setError("Este correo ya está registrado");
            } else {
                setError("Error al crear la cuenta");
            }
            console.error(err);
        }
    };

    return (
        <div className="form-container">
            <h2>Crear cuenta</h2>
            {error && (
                <p style={{ color: "#f15bb5", textAlign: "center" }}>{error}</p>
            )}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Correo electrónico</label>
                    <input
                        type="email"
                        placeholder="email@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Contraseña</label>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Confirmar contraseña</label>
                    <input
                        type="password"
                        placeholder="Repite la contraseña"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary">
                    Registrarse
                </button>
                <p style={{ marginTop: "15px", textAlign: "center" }}>
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>
            </form>
        </div>
    );
}

export default Crear;
