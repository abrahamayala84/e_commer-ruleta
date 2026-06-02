import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase"; // Ajusta la ruta según tu estructura

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/"); // Redirige al dashboard después de login
        } catch (err) {
            setError("Correo o contraseña incorrectos");
            console.error(err);
        }
    };

    return (
        <div className="form-container">
            <h2>Indicar Sesión</h2>
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
                <button type="submit" className="btn-primary">
                    Iniciar Sesión
                </button>
                <p style={{ marginTop: "15px", textAlign: "center" }}>
                    ¿No tienes cuenta? <Link to="/crear">Regístrate aquí</Link>
                </p>
            </form>
        </div>
    );
}

export default Login;
