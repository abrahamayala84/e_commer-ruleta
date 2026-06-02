import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import { updateProfile } from "firebase/auth";
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    getDocs,
    query,
    where,
    deleteDoc,
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";
import { QRCodeSVG } from "qrcode.react";

function Perfil() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [seccionActiva, setSeccionActiva] = useState("datos");

    // Sección 1: Datos del usuario
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [editandoDatos, setEditandoDatos] = useState(false);
    const [fechaRegistro, setFechaRegistro] = useState("");
    const [tiros, setTiros] = useState(3);
    const [premiosPendientes, setPremiosPendientes] = useState([]);
    const [premiosCanjeados, setPremiosCanjeados] = useState([]);

    // Sección 2: Tiros para la ruleta
    const [comprandoTiros, setComprandoTiros] = useState(false);

    // Sección 3: Negocios del usuario
    const [misNegocios, setMisNegocios] = useState([]);
    const [editandoNegocio, setEditandoNegocio] = useState(null);
    const [negocioEditando, setNegocioEditando] = useState(null);
    const [confirmarEliminacion, setConfirmarEliminacion] = useState(null);

    // Sección 4: Refresh
    const [refrescando, setRefrescando] = useState(false);

    useEffect(() => {
        cargarDatosCompletos();
    }, []);

    // ============================================
    // CARGAR TODOS LOS DATOS DEL USUARIO
    // ============================================
    const cargarDatosCompletos = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            navigate("/login");
            return;
        }

        setUser(currentUser);
        setDisplayName(currentUser.displayName || "");
        setEmail(currentUser.email || "");

        try {
            const userDoc = await getDoc(doc(db, "users", currentUser.uid));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setFechaRegistro(
                    data.fechaRegistro || new Date().toLocaleDateString(),
                );
                setTiros(data.tiros || 3);
            }

            await cargarPremios(currentUser.uid);
            await cargarNegociosDelUsuario(currentUser.uid);
        } catch (error) {
            console.error("Error:", error);
            setMensaje("Error al cargar datos: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // ============================================
    // CARGAR PREMIOS (PENDIENTES Y CANJEADOS)
    // ============================================
    const cargarPremios = async (userId) => {
        try {
            const negociosRef = collection(db, "negocios");
            const querySnapshot = await getDocs(negociosRef);
            const pendientes = [];
            const canjeados = [];

            for (const negocioDoc of querySnapshot.docs) {
                const negocioData = negocioDoc.data();
                const historial = negocioData.historial || [];

                const premiosPendientesUsuario = historial.filter(
                    (item) => item.usuarioId === userId && !item.canjeado,
                );

                premiosPendientesUsuario.forEach((premio) => {
                    pendientes.push({
                        id: `${negocioDoc.id}_${premio.timestamp}`,
                        ...premio,
                        negocioId: negocioDoc.id,
                        negocioNombre: negocioData.name || negocioData.nombre,
                        negocioLogo: negocioData.logoURL,
                        negocioCategoria:
                            negocioData.category || negocioData.genero,
                        negocioPhone:
                            negocioData.phone || negocioData.telefonos,
                        negocioAddress:
                            negocioData.address || negocioData.direccion,
                    });
                });

                const premiosCanjeadosUsuario = historial.filter(
                    (item) =>
                        item.usuarioId === userId && item.canjeado === true,
                );

                premiosCanjeadosUsuario.forEach((premio) => {
                    canjeados.push({
                        id: `${negocioDoc.id}_${premio.timestamp}`,
                        ...premio,
                        negocioId: negocioDoc.id,
                        negocioNombre: negocioData.name || negocioData.nombre,
                        negocioLogo: negocioData.logoURL,
                        negocioCategoria:
                            negocioData.category || negocioData.genero,
                    });
                });
            }

            pendientes.sort((a, b) => {
                const fechaA = a.timestamp?.toDate
                    ? a.timestamp.toDate()
                    : new Date(a.timestamp);
                const fechaB = b.timestamp?.toDate
                    ? b.timestamp.toDate()
                    : new Date(b.timestamp);
                return fechaB - fechaA;
            });

            canjeados.sort((a, b) => {
                const fechaA = a.fechaCanje?.toDate
                    ? a.fechaCanje.toDate()
                    : new Date(a.fechaCanje);
                const fechaB = b.fechaCanje?.toDate
                    ? b.fechaCanje.toDate()
                    : new Date(b.fechaCanje);
                return fechaB - fechaA;
            });

            setPremiosPendientes(pendientes);
            setPremiosCanjeados(canjeados);
        } catch (error) {
            console.error("Error al cargar premios:", error);
        }
    };

    // ============================================
    // CARGAR NEGOCIOS DEL USUARIO
    // ============================================
    const cargarNegociosDelUsuario = async (userId) => {
        try {
            const negociosRef = collection(db, "negocios");
            const negocios = [];

            const q1 = query(negociosRef, where("userId", "==", userId));
            const snapshot1 = await getDocs(q1);
            snapshot1.forEach((doc) => {
                negocios.push({ id: doc.id, ...doc.data() });
            });

            const q2 = query(negociosRef, where("creadoPor", "==", userId));
            const snapshot2 = await getDocs(q2);
            snapshot2.forEach((doc) => {
                if (!negocios.find((n) => n.id === doc.id)) {
                    negocios.push({ id: doc.id, ...doc.data() });
                }
            });

            setMisNegocios(negocios);
        } catch (error) {
            console.error("Error al cargar negocios:", error);
        }
    };

    // ============================================
    // ACTUALIZAR NEGOCIO (CORREGIDO)
    // ============================================
    const actualizarNegocio = async (negocioId, datosActualizados) => {
        try {
            const negocioRef = doc(db, "negocios", negocioId);
            await updateDoc(negocioRef, {
                ...datosActualizados,
                updatedAt: new Date(),
            });
            setMensaje("✅ Negocio actualizado correctamente");
            setTimeout(() => setMensaje(""), 3000);
            await cargarNegociosDelUsuario(user.uid);
            setEditandoNegocio(null);
            setNegocioEditando(null);
        } catch (error) {
            console.error("Error:", error);
            setMensaje("❌ Error al actualizar negocio: " + error.message);
        }
    };

    // ============================================
    // ELIMINAR NEGOCIO
    // ============================================
    const eliminarNegocio = async (negocio) => {
        try {
            if (negocio.logoURL) {
                try {
                    const logoRef = ref(
                        storage,
                        `logos/${user.uid}/${negocio.id}`,
                    );
                    await deleteObject(logoRef);
                } catch (err) {
                    console.log("No se pudo eliminar el logo:", err);
                }
            }

            const negocioRef = doc(db, "negocios", negocio.id);
            await deleteDoc(negocioRef);

            setMensaje(
                `✅ Negocio "${negocio.name || negocio.nombre}" eliminado correctamente`,
            );
            await cargarNegociosDelUsuario(user.uid);
            setConfirmarEliminacion(null);
            setTimeout(() => setMensaje(""), 3000);
        } catch (error) {
            console.error("Error:", error);
            setMensaje("❌ Error al eliminar el negocio");
        }
    };

    // Actualizar datos del usuario
    const actualizarDatos = async () => {
        try {
            await updateProfile(user, { displayName });
            setEditandoDatos(false);
            setMensaje("✅ Datos actualizados");
            setTimeout(() => setMensaje(""), 3000);
        } catch (error) {
            console.error("Error:", error);
            setMensaje("❌ Error al actualizar");
        }
    };

    // Comprar tiros
    const comprarTiros = async (cantidad, precio) => {
        setComprandoTiros(true);
        try {
            const nuevosTiros = tiros + cantidad;
            setTiros(nuevosTiros);

            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { tiros: nuevosTiros });

            setMensaje(`✅ Has comprado ${cantidad} tiros por $${precio}`);
            setTimeout(() => setMensaje(""), 3000);
        } catch (error) {
            console.error("Error:", error);
            setMensaje("❌ Error en la compra");
        } finally {
            setComprandoTiros(false);
        }
    };

    // Refrescar datos
    const refrescarDatos = async () => {
        setRefrescando(true);
        await cargarDatosCompletos();
        setRefrescando(false);
        setMensaje("✅ Datos actualizados");
        setTimeout(() => setMensaje(""), 2000);
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="form-container" style={{ textAlign: "center" }}>
                    <h3>🔄 Cargando perfil...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="perfil-container">
            {/* Pestañas */}
            <div className="perfil-tabs">
                <button
                    className={`tab-btn ${seccionActiva === "datos" ? "active" : ""}`}
                    onClick={() => setSeccionActiva("datos")}
                >
                    👤 Mis Datos
                </button>
                <button
                    className={`tab-btn ${seccionActiva === "tiros" ? "active" : ""}`}
                    onClick={() => setSeccionActiva("tiros")}
                >
                    🎯 Comprar Tiros
                </button>
                <button
                    className={`tab-btn ${seccionActiva === "negocios" ? "active" : ""}`}
                    onClick={() => setSeccionActiva("negocios")}
                >
                    🏪 Mis Negocios ({misNegocios.length})
                </button>
                <button
                    className={`tab-btn ${seccionActiva === "refresh" ? "active" : ""}`}
                    onClick={() => setSeccionActiva("refresh")}
                >
                    🔄 Refrescar
                </button>
            </div>

            {mensaje && <div className="mensaje-flotante">{mensaje}</div>}

            {/* ========== SECCIÓN 1: DATOS DEL USUARIO Y PREMIOS ========== */}
            {seccionActiva === "datos" && (
                <div className="seccion-perfil">
                    <div className="card-perfil">
                        <h2>👤 Datos del Usuario</h2>
                        <div className="info-usuario">
                            <div className="campo">
                                <label>Nombre:</label>
                                {editandoDatos ? (
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) =>
                                            setDisplayName(e.target.value)
                                        }
                                    />
                                ) : (
                                    <p>{displayName || "Sin nombre"}</p>
                                )}
                            </div>
                            <div className="campo">
                                <label>Email:</label>
                                <p>{email}</p>
                            </div>
                            <div className="campo">
                                <label>Fecha de registro:</label>
                                <p>{fechaRegistro}</p>
                            </div>
                            <div className="campo">
                                <label>Tiros disponibles:</label>
                                <p className="tiros-disponibles">
                                    🎯 {tiros} tiros
                                </p>
                            </div>
                        </div>
                        {editandoDatos ? (
                            <div className="acciones">
                                <button
                                    className="btn-guardar"
                                    onClick={actualizarDatos}
                                >
                                    💾 Guardar
                                </button>
                                <button
                                    className="btn-cancelar"
                                    onClick={() => setEditandoDatos(false)}
                                >
                                    Cancelar
                                </button>
                            </div>
                        ) : (
                            <button
                                className="btn-editar"
                                onClick={() => setEditandoDatos(true)}
                            >
                                ✏️ Editar perfil
                            </button>
                        )}
                    </div>

                    {/* Premios PENDIENTES */}
                    <div className="card-perfil">
                        <h2>🎁 Premios Pendientes de Canje</h2>
                        {premiosPendientes.length === 0 ? (
                            <div className="vacio-container">
                                <p>📭 No tienes premios pendientes</p>
                                <button
                                    className="btn-primary"
                                    onClick={() => navigate("/")}
                                >
                                    Girar ruleta
                                </button>
                            </div>
                        ) : (
                            <div className="premios-grid">
                                {premiosPendientes.map((premio, idx) => (
                                    <div
                                        key={idx}
                                        className="premio-pendiente-card"
                                    >
                                        <div className="premio-card-header">
                                            {premio.negocioLogo && (
                                                <img
                                                    src={premio.negocioLogo}
                                                    alt={premio.negocioNombre}
                                                    className="negocio-logo-mini"
                                                />
                                            )}
                                            <div className="negocio-info-mini">
                                                <h3>{premio.negocioNombre}</h3>
                                                <span className="categoria-mini">
                                                    {premio.negocioCategoria ||
                                                        "Negocio"}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="premio-card-body">
                                            <div className="premio-info">
                                                <p className="premio-nombre">
                                                    🎁 {premio.premio}
                                                </p>
                                                <p className="premio-fecha">
                                                    📅 Ganado:{" "}
                                                    {premio.timestamp?.toDate
                                                        ? new Date(
                                                              premio.timestamp.toDate(),
                                                          ).toLocaleDateString()
                                                        : new Date(
                                                              premio.timestamp,
                                                          ).toLocaleDateString()}
                                                </p>
                                                <div className="negocio-contacto">
                                                    <p>
                                                        📞{" "}
                                                        {premio.negocioPhone ||
                                                            "Sin teléfono"}
                                                    </p>
                                                    <p>
                                                        📍{" "}
                                                        {premio.negocioAddress ||
                                                            "Sin dirección"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="premio-qr-container">
                                                <QRCodeSVG
                                                    value={`${premio.id}|${premio.negocioId}|${premio.premio}`}
                                                    size={100}
                                                />
                                                <p className="qr-text">
                                                    Escanea para canjear
                                                </p>
                                            </div>
                                        </div>
                                        <div className="premio-card-footer">
                                            <span className="estado-pendiente-badge">
                                                ⏳ Pendiente
                                            </span>
                                            <button
                                                className="btn-canjear-ahora"
                                                onClick={() =>
                                                    navigate("/canjear")
                                                }
                                            >
                                                🎫 Canjear ahora
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ========== SECCIÓN 2: COMPRA DE TIROS ========== */}
            {seccionActiva === "tiros" && (
                <div className="seccion-perfil">
                    <div className="card-perfil">
                        <h2>🎯 Comprar Tiros</h2>
                        <p className="tiros-actuales">
                            Tiros actuales: <strong>{tiros}</strong>
                        </p>
                        <div className="paquetes-tiros">
                            <div
                                className="paquete"
                                onClick={() => comprarTiros(5, 25)}
                            >
                                <h3>🎯 5 Tiros</h3>
                                <p className="precio">$25 MXN</p>
                                <button disabled={comprandoTiros}>
                                    Comprar
                                </button>
                            </div>
                            <div
                                className="paquete"
                                onClick={() => comprarTiros(10, 45)}
                            >
                                <h3>🎯 10 Tiros</h3>
                                <p className="precio">$45 MXN</p>
                                <p className="ahorro">🔥 Ahorra $5</p>
                                <button disabled={comprandoTiros}>
                                    Comprar
                                </button>
                            </div>
                            <div
                                className="paquete"
                                onClick={() => comprarTiros(20, 80)}
                            >
                                <h3>🎯 20 Tiros</h3>
                                <p className="precio">$80 MXN</p>
                                <p className="ahorro">🔥 Ahorra $20</p>
                                <button disabled={comprandoTiros}>
                                    Comprar
                                </button>
                            </div>
                            <div
                                className="paquete"
                                onClick={() => comprarTiros(50, 180)}
                            >
                                <h3>🎯 50 Tiros</h3>
                                <p className="precio">$180 MXN</p>
                                <p className="ahorro">🔥 Ahorra $70</p>
                                <button disabled={comprandoTiros}>
                                    Comprar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ========== SECCIÓN 3: MIS NEGOCIOS ========== */}
            {seccionActiva === "negocios" && (
                <div className="seccion-perfil">
                    {misNegocios.map((negocio) => (
                        <div
                            key={negocio.id}
                            className="card-perfil negocio-card"
                        >
                            <div className="negocio-header">
                                {negocio.logoURL && (
                                    <img
                                        src={negocio.logoURL}
                                        alt="Logo"
                                        className="negocio-logo"
                                    />
                                )}
                                <div className="negocio-info">
                                    <h3>{negocio.name || negocio.nombre}</h3>
                                    <p className="categoria">
                                        {negocio.category || negocio.genero}
                                    </p>
                                    <p>
                                        📞 {negocio.phone || negocio.telefonos}
                                    </p>
                                    <p>
                                        📍{" "}
                                        {negocio.address || negocio.direccion}
                                    </p>
                                </div>
                            </div>
                            <div className="negocio-acciones">
                                <button
                                    className="btn-editar"
                                    onClick={() => {
                                        setEditandoNegocio(negocio.id);
                                        setNegocioEditando(negocio);
                                    }}
                                >
                                    ✏️ Editar
                                </button>
                                <button
                                    className="btn-ver"
                                    onClick={() =>
                                        navigate(`/ruleta/${negocio.id}`)
                                    }
                                >
                                    🎡 Ver ruleta
                                </button>
                                <button
                                    className="btn-eliminar-negocio"
                                    onClick={() =>
                                        setConfirmarEliminacion(negocio)
                                    }
                                >
                                    🗑️ Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ========== SECCIÓN 4: REFRESCAR ========== */}
            {seccionActiva === "refresh" && (
                <div className="seccion-perfil">
                    <div className="card-perfil refresh-card">
                        <h2>🔄 Actualizar Datos</h2>
                        <button
                            className="btn-refrescar"
                            onClick={refrescarDatos}
                            disabled={refrescando}
                        >
                            {refrescando
                                ? "🔄 Actualizando..."
                                : "🔄 Refrescar Datos"}
                        </button>
                    </div>
                </div>
            )}

            {/* Modales */}
            {confirmarEliminacion && (
                <div className="modal-overlay">
                    <div className="modal-confirm">
                        <h3>⚠️ Eliminar Negocio</h3>
                        <p>
                            ¿Eliminar{" "}
                            <strong>
                                "
                                {confirmarEliminacion.name ||
                                    confirmarEliminacion.nombre}
                                "
                            </strong>
                            ?
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn-danger"
                                onClick={() =>
                                    eliminarNegocio(confirmarEliminacion)
                                }
                            >
                                Sí, eliminar
                            </button>
                            <button
                                className="btn-secundario"
                                onClick={() => setConfirmarEliminacion(null)}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {editandoNegocio && negocioEditando && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>✏️ Editar Negocio</h2>
                        <FormularioEdicionNegocio
                            negocio={negocioEditando}
                            onGuardar={actualizarNegocio}
                            onCancelar={() => {
                                setEditandoNegocio(null);
                                setNegocioEditando(null);
                            }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

// Componente para editar negocio
function FormularioEdicionNegocio({ negocio, onGuardar, onCancelar }) {
    const [nombre, setNombre] = useState(negocio.name || negocio.nombre || "");
    const [categoria, setCategoria] = useState(
        negocio.category || negocio.genero || "",
    );
    const [telefono, setTelefono] = useState(
        negocio.phone || negocio.telefonos || "",
    );
    const [direccion, setDireccion] = useState(
        negocio.address || negocio.direccion || "",
    );

    const handleSubmit = () => {
        onGuardar(negocio.id, {
            name: nombre,
            category: categoria,
            phone: telefono,
            address: direccion,
        });
    };

    return (
        <div className="form-editar-negocio">
            <div className="form-group">
                <label>Nombre</label>
                <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Categoría</label>
                <input
                    type="text"
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Teléfono</label>
                <input
                    type="text"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Dirección</label>
                <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                />
            </div>
            <div className="form-actions">
                <button className="btn-guardar" onClick={handleSubmit}>
                    💾 Guardar
                </button>
                <button className="btn-cancelar" onClick={onCancelar}>
                    Cancelar
                </button>
            </div>
        </div>
    );
}

export default Perfil;
