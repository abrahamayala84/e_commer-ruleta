import React, { useRef, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

function Ruleta() {
    const { id } = useParams();
    const navigate = useNavigate();
    const canvasRef = useRef(null);
    const [girando, setGirando] = useState(false);
    const [resultado, setResultado] = useState(null);
    const [business, setBusiness] = useState(null);
    const [premios, setPremios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const colores = [
        "#f15bb5",
        "#9b5de5",
        "#00bbf9",
        "#00f5d4",
        "#fee440",
        "#f15bb5",
        "#9b5de5",
        "#00bbf9",
    ];

    // Cargar datos del negocio desde Firebase
    useEffect(() => {
        const loadBusiness = async () => {
            try {
                setLoading(true);
                setError(null);

                console.log("🔍 Cargando negocio ID:", id);

                const docRef = doc(db, "negocios", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    console.log("📦 Datos completos:", data);

                    setBusiness(data);

                    let premiosRaw = [];

                    if (data.prizes && Array.isArray(data.prizes)) {
                        premiosRaw = data.prizes;
                        console.log("✅ Usando 'prizes'");
                    } else if (data.premios && Array.isArray(data.premios)) {
                        premiosRaw = data.premios;
                        console.log("✅ Usando 'premios'");
                    }

                    console.log("📋 Premios raw:", premiosRaw);

                    const premiosFormateados = [];

                    if (premiosRaw.length > 0) {
                        for (let i = 0; i < premiosRaw.length && i < 8; i++) {
                            const p = premiosRaw[i];
                            premiosFormateados.push({
                                id: i,
                                isFollow:
                                    p.isFollow === true || p.tipo === "sigue",
                                nombre:
                                    p.nombre ||
                                    p.name ||
                                    (p.isFollow
                                        ? "Sigue participando"
                                        : `Premio ${i + 1}`),
                                disponibles: p.disponibles || p.available || 0,
                                expiracion:
                                    p.expiracion ||
                                    p.expiry ||
                                    "Sin expiración",
                            });
                        }
                    } else {
                        console.log("⚠️ No hay premios, creando por defecto");
                        for (let i = 0; i < 8; i++) {
                            premiosFormateados.push({
                                id: i,
                                isFollow: i % 2 === 0,
                                nombre:
                                    i % 2 === 0
                                        ? "Sigue participando"
                                        : `Premio ${i + 1}`,
                                disponibles: 10,
                                expiracion: "31/12/2025",
                            });
                        }
                    }

                    while (premiosFormateados.length < 8) {
                        premiosFormateados.push({
                            id: premiosFormateados.length,
                            isFollow: true,
                            nombre: "Sigue participando",
                            disponibles: 0,
                            expiracion: "Sin expiración",
                        });
                    }

                    console.log("🎁 Premios finales:", premiosFormateados);
                    setPremios(premiosFormateados);
                } else {
                    console.error("❌ Negocio no encontrado");
                    setError("El negocio no existe");
                    setTimeout(() => navigate("/"), 2000);
                }
            } catch (error) {
                console.error("❌ Error al cargar:", error);
                setError("Error al cargar los datos");
            } finally {
                setLoading(false);
            }
        };

        if (id) loadBusiness();
    }, [id, navigate]);

    // Dibujar ruleta
    useEffect(() => {
        if (!loading && premios.length > 0) {
            const timer = setTimeout(() => dibujarRuleta(), 100);
            return () => clearTimeout(timer);
        }
    }, [premios, loading]);

    const dibujarRuleta = () => {
        const canvas = canvasRef.current;
        if (!canvas || premios.length === 0) return;

        const ctx = canvas.getContext("2d");
        const width = canvas.width;
        const height = canvas.height;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = width / 2;

        ctx.clearRect(0, 0, width, height);

        const anguloPorSegmento = (Math.PI * 2) / premios.length;

        premios.forEach((premio, index) => {
            const startAngle = index * anguloPorSegmento;
            const endAngle = startAngle + anguloPorSegmento;

            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.fillStyle = colores[index % colores.length];
            ctx.fill();
            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.stroke();

            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + anguloPorSegmento / 2);
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "white";
            ctx.font = "bold 10px 'Segoe UI'";
            ctx.shadowBlur = 0;

            let texto = premio.nombre || "Premio";
            if (premio.isFollow) texto = "🔄 Sigue";
            if (texto.length > 12) texto = texto.substring(0, 10) + "..";
            ctx.fillText(texto, radius * 0.68, 0);
            ctx.restore();
        });

        ctx.beginPath();
        ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();
        ctx.strokeStyle = "#333";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = "#333";
        ctx.font = "bold 16px 'Segoe UI'";
        ctx.fillText("🎰", centerX, centerY);
    };

    const girarRuleta = () => {
        if (girando) return;

        setGirando(true);
        setResultado(null);

        const canvas = canvasRef.current;
        const anguloPorSegmento = (Math.PI * 2) / premios.length;
        const vueltas = Math.random() * 10 + 20;
        const anguloDestino = Math.random() * (Math.PI * 2);

        let inicio = null;
        let anguloActual = 0;

        const animar = (timestamp) => {
            if (!inicio) inicio = timestamp;
            const progreso = Math.min(1, (timestamp - inicio) / 3000);
            const easeOut = 1 - Math.pow(1 - progreso, 3);

            anguloActual =
                vueltas * 2 * Math.PI * easeOut + anguloDestino * easeOut;
            canvas.style.transform = `rotate(${anguloActual}rad)`;

            if (progreso < 1) {
                requestAnimationFrame(animar);
            } else {
                const anguloFlecha = -Math.PI / 2;
                const anguloFinal = anguloActual % (Math.PI * 2);

                let anguloSegmentoGanador =
                    (anguloFlecha - anguloFinal) % (Math.PI * 2);
                if (anguloSegmentoGanador < 0)
                    anguloSegmentoGanador += Math.PI * 2;

                let indiceGanador = Math.floor(
                    anguloSegmentoGanador / anguloPorSegmento,
                );
                if (indiceGanador >= premios.length) indiceGanador = 0;

                const premioGanado = {
                    ...premios[indiceGanador],
                    id: indiceGanador,
                };

                console.log("=== DEBUG ===");
                console.log("Índice ganador:", indiceGanador + 1);
                console.log("Premio:", premioGanado.nombre);
                console.log("============");

                setResultado(premioGanado);
                setGirando(false);

                if (!premioGanado.isFollow && premioGanado.disponibles > 0) {
                    guardarResultado(premioGanado, indiceGanador);
                }
            }
        };

        requestAnimationFrame(animar);
    };

    const guardarResultado = async (premio, indice) => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const docRef = doc(db, "negocios", id);

            await updateDoc(docRef, {
                historial: arrayUnion({
                    usuarioId: user.uid,
                    usuarioEmail: user.email,
                    premio: premio.nombre,
                    negocioId: id,
                    negocioNombre: business?.name || business?.nombre,
                    timestamp: new Date(),
                    canjeado: false,
                    indice: indice,
                }),
            });

            console.log("✅ Premio guardado");

            const nuevosPremios = [...premios];
            if (
                nuevosPremios[indice] &&
                nuevosPremios[indice].disponibles > 0
            ) {
                nuevosPremios[indice].disponibles -= 1;
                setPremios(nuevosPremios);

                const docSnap = await getDoc(docRef);
                const data = docSnap.data();
                let premiosFirebase = data.prizes || data.premios || [];
                if (premiosFirebase[indice]) {
                    premiosFirebase[indice].disponibles =
                        nuevosPremios[indice].disponibles;
                    await updateDoc(docRef, {
                        prizes: premiosFirebase,
                        premios: premiosFirebase,
                    });
                }
            }

            // ✅ REDIRIGIR AL CATÁLOGO DESPUÉS DE GANAR (solo si no es "Sigue participando")
            if (!premio.isFollow) {
                setTimeout(() => {
                    navigate(`/catalogo/${id}/${indice}`);
                }, 2000);
            }
        } catch (error) {
            console.error("❌ Error al guardar:", error);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="form-container" style={{ textAlign: "center" }}>
                    <h3>🔄 Cargando ruleta...</h3>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container">
                <div className="form-container" style={{ textAlign: "center" }}>
                    <h3>❌ Error</h3>
                    <p>{error}</p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate("/")}
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="ruleta-page">
            <div className="ruleta-canvas-wrap">
                <div className="ruleta-flecha">▼</div>
                <canvas
                    ref={canvasRef}
                    className="ruleta-canvas"
                    width="340"
                    height="340"
                ></canvas>
            </div>

            <button className="RL" onClick={girarRuleta} disabled={girando}>
                {girando ? "🎡 Girando..." : "🎡 Girar"}
            </button>

            {resultado && (
                <div className="resultado-alert">
                    <div
                        className="prize-card"
                        style={{
                            textAlign: "center",
                            margin: "10px auto",
                            maxWidth: "300px",
                        }}
                    >
                        <h3>🎉 ¡Resultado! 🎉</h3>
                        <p style={{ fontSize: "1.2rem", color: "#f15bb5" }}>
                            {resultado.isFollow
                                ? "🔄 Sigue participando"
                                : `¡Ganaste: ${resultado.nombre}!`}
                        </p>
                        {!resultado.isFollow && resultado.disponibles > 0 && (
                            <p style={{ fontSize: "0.8rem", color: "#4ade80" }}>
                                Quedan {resultado.disponibles - 1} disponibles
                            </p>
                        )}
                        {!resultado.isFollow && (
                            <p
                                style={{
                                    fontSize: "0.7rem",
                                    color: "#aaa",
                                    marginTop: "5px",
                                }}
                            >
                                Redirigiendo al catálogo...
                            </p>
                        )}
                    </div>
                </div>
            )}

            <div className="premios-lista">
                <h3>🎁 Premios disponibles</h3>
                <div className="premios-grid">
                    {premios.map((premio, idx) => (
                        <div
                            key={idx}
                            className={`premio-chip ${premio.disponibles === 0 && !premio.isFollow ? "agotado" : ""} ${resultado && resultado.id === idx ? "premio-destacado" : ""}`}
                        >
                            <span className="premio-num">{idx + 1}</span>
                            <span className="premio-nombre">
                                {premio.isFollow
                                    ? "🔄 Sigue participando"
                                    : premio.nombre || "Premio"}
                            </span>
                            {!premio.isFollow && premio.disponibles > 0 && (
                                <span className="premio-cantidad">
                                    🎫 x{premio.disponibles}
                                </span>
                            )}
                            {!premio.isFollow && premio.disponibles === 0 && (
                                <span className="premio-cantidad">
                                    ❌ Agotado
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Ruleta;
