import { Button } from "react-bootstrap";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export const GoogleLoginButton = () => {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            // El usuario ya está autenticado, puedes obtener información si lo deseas
            console.log("Usuario logueado con Google:", result.user);
            navigate("/"); // Redirigir al dashboard
        } catch (error) {
            console.error("Error al iniciar sesión con Google:", error);
            // Manejo de errores (puedes mostrar un mensaje al usuario)
            alert("Error al iniciar sesión con Google. Intenta de nuevo.");
        }
    };

    return (
        <Button
            variant="danger"
            onClick={handleGoogleLogin}
            className="mt-3 w-100"
        >
            <i className="bi bi-google"></i> Iniciar sesión con Google
        </Button>
    );
};
