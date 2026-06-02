import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

function Dashboard() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("");
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadBusinesses = async () => {
        try {
            setLoading(true);
            setError(null);

            console.log("🔍 Cargando negocios desde Firebase...");

            const negociosRef = collection(db, "negocios");
            const querySnapshot = await getDocs(negociosRef);

            console.log(`📊 Documentos encontrados: ${querySnapshot.size}`);

            if (querySnapshot.empty) {
                console.log("⚠️ No hay documentos en la colección 'negocios'");
                setBusinesses([]);
                return;
            }

            const negociosList = [];

            for (const doc of querySnapshot.docs) {
                const data = doc.data();
                console.log(`📄 Procesando documento ${doc.id}:`, data);

                // Obtener la URL del logo (soporta diferentes nombres de campo)
                let imageUrl =
                    data.logoURL || data.imagenURL || data.logo || null;

                // Obtener nombre (soporta diferentes nombres de campo)
                const nombre = data.name || data.nombre || "Sin nombre";

                // Obtener categoría (soporta diferentes nombres de campo)
                const categoria =
                    data.category ||
                    data.genero ||
                    data.categoria ||
                    "Sin categoría";

                // Obtener teléfono (soporta diferentes nombres de campo)
                const telefono =
                    data.phone ||
                    data.telefonos ||
                    data.telefono ||
                    "Sin teléfono";

                // Obtener dirección (soporta diferentes nombres de campo)
                const direccion =
                    data.address || data.direccion || "Sin dirección";

                // Obtener premios (soporta diferentes nombres de campo y estructuras)
                let premiosData = [];
                if (data.prizes && Array.isArray(data.prizes)) {
                    premiosData = data.prizes;
                } else if (data.premios && Array.isArray(data.premios)) {
                    premiosData = data.premios;
                }

                // Formatear premios para mostrar
                const premiosFormateados = premiosData.map((premio) => {
                    let nombrePremio = premio.nombre || premio.name || "Premio";
                    if (nombrePremio.length > 20)
                        nombrePremio = nombrePremio.substring(0, 18) + "...";

                    return {
                        nombre: nombrePremio,
                        isFollow:
                            premio.isFollow === true || premio.tipo === "sigue",
                        disponibles:
                            premio.disponibles || premio.available || 0,
                    };
                });

                negociosList.push({
                    id: doc.id,
                    name: nombre,
                    category: categoria,
                    phone: telefono,
                    address: direccion,
                    imageUrl: imageUrl,
                    userId: data.userId || data.creadoPor || "",
                    userEmail: data.userEmail || "",
                    createdAt:
                        data.createdAt || data.fechaCreacion || new Date(),
                    prizes: premiosFormateados,
                    premiosOriginales: premiosData,
                    historial: data.historial || [],
                });
            }

            console.log(`✅ Negocios cargados: ${negociosList.length}`);
            setBusinesses(negociosList);
        } catch (err) {
            console.error("❌ Error al cargar negocios:", err);
            setError(`Error al cargar datos: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBusinesses();
    }, []);

    // Filtrar negocios por búsqueda y categoría
    const filteredBusinesses = businesses.filter((biz) => {
        const matchSearch =
            searchTerm === "" ||
            (biz.name &&
                biz.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (biz.category &&
                biz.category.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchCategory = category === "" || biz.category === category;

        return matchSearch && matchCategory;
    });

    // Obtener categorías únicas para el filtro
    const uniqueCategories = [
        ...new Set(
            businesses
                .map((biz) => biz.category)
                .filter((cat) => cat && cat !== "Sin categoría"),
        ),
    ];

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="form-container" style={{ textAlign: "center" }}>
                    <h3>🔄 Cargando negocios...</h3>
                    <p>Conectando con Firebase...</p>
                    <div style={{ marginTop: "20px" }}>
                        <div className="spinner"></div>
                    </div>
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
                        onClick={loadBusinesses}
                        style={{ marginTop: "20px" }}
                    >
                        🔄 Reintentar
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* SECCIÓN EXPLICATIVA DE LA APP */}
            <div className="app-explanation">
                <h1>🎰 Ruleta App</h1>
                <p className="subtitle">
                    Gira, gana y descubre premios increíbles
                </p>
                <p className="description">
                    Ruleta App es una plataforma interactiva que conecta
                    negocios locales con clientes a través de una experiencia
                    divertida y gratificante. Cada negocio tiene su propia
                    ruleta virtual con premios exclusivos: descuentos, productos
                    gratis y sorpresas.
                </p>
                <div className="app-features">
                    <span className="feature">🎡 Gira la ruleta</span>
                    <span className="feature">🎁 Gana premios reales</span>
                    <span className="feature">🏪 Descubre negocios</span>
                    <span className="feature">💾 Canjea tus premios</span>
                </div>
            </div>

            {/* EXPLICACIÓN DEL DASHBOARD */}
            <div className="dashboard-explanation">
                <h2>📋 Panel de Negocios</h2>
                <p>
                    {businesses.length === 0
                        ? "No hay negocios registrados todavía. ¡Sé el primero en agregar uno!"
                        : `Actualmente hay ${businesses.length} negocio(s) disponible(s) para jugar.`}
                </p>
            </div>

            <div className="dashboard-header">
                <h1>Descubre premios reales</h1>
                <p>Participa y gana descuentos, productos gratis y más</p>
            </div>

            <button
                className="add-business-btn"
                onClick={() => navigate("/agregar")}
            >
                + Agregar negocio
            </button>

            {/* Filtros - solo mostrar si hay negocios */}
            {businesses.length > 0 && (
                <div className="filters">
                    <input
                        type="text"
                        placeholder="🔍 Buscar por nombre o categoría"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {uniqueCategories.length > 0 && (
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">📁 Todas las categorías</option>
                            {uniqueCategories.map((cat, idx) => (
                                <option key={idx} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    )}

                    <button
                        onClick={() => {
                            setSearchTerm("");
                            setCategory("");
                        }}
                    >
                        🧹 Limpiar filtros
                    </button>
                </div>
            )}

            {/* Grid de negocios */}
            {filteredBusinesses.length === 0 ? (
                <div className="form-container" style={{ textAlign: "center" }}>
                    {businesses.length === 0 ? (
                        <>
                            <h3>📭 No hay negocios registrados</h3>
                            <p>
                                ¡Agrega tu primer negocio y comienza a ofrecer
                                premios!
                            </p>
                            <button
                                className="btn-primary"
                                onClick={() => navigate("/agregar")}
                                style={{ marginTop: "20px" }}
                            >
                                + Agregar negocio
                            </button>
                        </>
                    ) : (
                        <>
                            <h3>🔍 No se encontraron resultados</h3>
                            <p>
                                No hay negocios que coincidan con "{searchTerm}"
                            </p>
                            <button
                                className="btn-primary"
                                onClick={() => {
                                    setSearchTerm("");
                                    setCategory("");
                                }}
                                style={{ marginTop: "20px" }}
                            >
                                Ver todos los negocios
                            </button>
                        </>
                    )}
                </div>
            ) : (
                <div className="business-grid">
                    {filteredBusinesses.map((biz) => (
                        <div
                            key={biz.id}
                            className="business-card"
                            onClick={() => navigate(`/ruleta/${biz.id}`)}
                        >
                            <div className="business-card-header">
                                <div className="business-logo-container">
                                    {biz.imageUrl ? (
                                        <img
                                            src={biz.imageUrl}
                                            alt={biz.name}
                                            className="business-logo"
                                            loading="lazy"
                                            onError={(e) => {
                                                console.log(
                                                    `Error cargando logo para ${biz.name}`,
                                                );
                                                e.target.style.display = "none";
                                                if (
                                                    e.target.parentElement.querySelector(
                                                        ".business-logo-placeholder",
                                                    )
                                                ) {
                                                    e.target.parentElement.querySelector(
                                                        ".business-logo-placeholder",
                                                    ).style.display = "flex";
                                                }
                                            }}
                                        />
                                    ) : null}
                                    <div
                                        className="business-logo-placeholder"
                                        style={{
                                            display: biz.imageUrl
                                                ? "none"
                                                : "flex",
                                        }}
                                    >
                                        🎰
                                    </div>
                                </div>
                                <h3>{biz.name}</h3>
                                <span className="category">{biz.category}</span>
                            </div>

                            <div className="business-card-body">
                                <p>📞 {biz.phone}</p>
                                <p>📍 {biz.address}</p>

                                <div className="prizes-preview">
                                    <strong
                                        style={{
                                            fontSize: "12px",
                                            marginBottom: "8px",
                                            display: "block",
                                        }}
                                    >
                                        🎁 Premios disponibles:
                                    </strong>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexWrap: "wrap",
                                            gap: "6px",
                                        }}
                                    >
                                        {biz.prizes && biz.prizes.length > 0 ? (
                                            biz.prizes
                                                .slice(0, 4)
                                                .map((prize, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="prize-badge"
                                                    >
                                                        {prize.isFollow
                                                            ? "🔄"
                                                            : "🎲"}{" "}
                                                        {prize.nombre}
                                                    </span>
                                                ))
                                        ) : (
                                            <span className="prize-badge">
                                                🎁 ¡Gira y gana!
                                            </span>
                                        )}
                                        {biz.prizes &&
                                            biz.prizes.length > 4 && (
                                                <span className="prize-badge">
                                                    +{biz.prizes.length - 4}
                                                </span>
                                            )}
                                    </div>
                                </div>
                            </div>

                            <div className="business-card-footer">
                                <button className="play-button">
                                    🎡 Jugar ahora
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Botón para recargar datos (debug) */}
            <div
                style={{
                    textAlign: "center",
                    marginTop: "30px",
                    marginBottom: "20px",
                }}
            >
                <button
                    onClick={loadBusinesses}
                    style={{
                        background: "transparent",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "20px",
                        padding: "6px 15px",
                        color: "#888",
                        fontSize: "0.7rem",
                        cursor: "pointer",
                    }}
                >
                    🔄 Recargar datos
                </button>
            </div>
        </div>
    );
}

export default Dashboard;
