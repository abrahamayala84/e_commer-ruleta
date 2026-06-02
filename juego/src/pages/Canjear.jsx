import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import {
    collection,
    getDocs,
    updateDoc,
    doc,
    getDoc,
} from "firebase/firestore";

function Canjear() {
    const navigate = useNavigate();
    const [negociosData, setNegociosData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mensaje, setMensaje] = useState("");
    const [esDueno, setEsDueno] = useState(false);
    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [premioSeleccionado, setPremioSeleccionado] = useState(null);
    const [negocioActual, setNegocioActual] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const user = auth.currentUser;
            if (!user) {
                navigate("/login");
                return;
            }

            try {
                const negociosRef = collection(db, "negocios");
                const querySnapshot = await getDocs(negociosRef);

                const negociosConDatos = [];
                let tieneNegocios = false;

                for (const negocioDoc of querySnapshot.docs) {
                    const negocioData = negocioDoc.data();
                    const historial = negocioData.historial || [];
                    const productos = negocioData.productos || [];

                    if (negocioData.userId === user.uid) {
                        tieneNegocios = true;
                    }

                    // Filtrar premios NO canjeados del usuario
                    const premiosPendientes = historial.filter(
                        (item) => item.usuarioId === user.uid && !item.canjeado,
                    );

                    if (premiosPendientes.length > 0 && productos.length > 0) {
                        negociosConDatos.push({
                            id: negocioDoc.id,
                            nombre: negocioData.name || negocioData.nombre,
                            logo: negocioData.logoURL,
                            categoria:
                                negocioData.category || negocioData.genero,
                            phone: negocioData.phone || negocioData.telefonos,
                            premios: premiosPendientes,
                            productos: productos,
                        });
                    }
                }

                console.log("📦 Negocios con datos:", negociosConDatos.length);
                setNegociosData(negociosConDatos);
                setEsDueno(tieneNegocios);
            } catch (error) {
                console.error("Error:", error);
                setMensaje("Error al cargar los datos");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [navigate]);

    const generarCodigoCanje = () => {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    const abrirConfirmacion = (producto, premio, negocio) => {
        setProductoSeleccionado(producto);
        setPremioSeleccionado(premio);
        setNegocioActual(negocio);
        setMostrarConfirmacion(true);
    };

    const confirmarCanje = async () => {
        if (!productoSeleccionado || !premioSeleccionado || !negocioActual)
            return;

        try {
            const user = auth.currentUser;
            if (!user) {
                navigate("/login");
                return;
            }

            const negocioRef = doc(db, "negocios", negocioActual.id);
            const docSnap = await getDoc(negocioRef);
            const negocioData = docSnap.data();

            const codigo = generarCodigoCanje();

            // Marcar el premio específico como canjeado
            const historialActual = negocioData.historial || [];
            const historialActualizado = historialActual.map((item) => {
                // Comparar por timestamp y usuarioId
                const itemTimestamp = item.timestamp?.toDate
                    ? item.timestamp.toDate().getTime()
                    : new Date(item.timestamp).getTime();
                const premioTimestamp = premioSeleccionado.timestamp?.toDate
                    ? premioSeleccionado.timestamp.toDate().getTime()
                    : new Date(premioSeleccionado.timestamp).getTime();

                if (
                    itemTimestamp === premioTimestamp &&
                    item.usuarioId === user.uid
                ) {
                    return {
                        ...item,
                        canjeado: true,
                        codigoCanje: codigo,
                        fechaCanje: new Date(),
                        productoCanjeado: productoSeleccionado.nombre,
                        descuentoAplicado: productoSeleccionado.descuento || 0,
                    };
                }
                return item;
            });

            await updateDoc(negocioRef, { historial: historialActualizado });

            // Actualizar stock del producto
            const productosActualizados = [...(negocioData.productos || [])];
            const productoIndex = productosActualizados.findIndex(
                (p) => p.id === productoSeleccionado.id,
            );
            if (
                productoIndex !== -1 &&
                productosActualizados[productoIndex].stock > 0
            ) {
                productosActualizados[productoIndex].stock -= 1;
                await updateDoc(negocioRef, {
                    productos: productosActualizados,
                });
            }

            let mensajeCanje = `✅ ¡Canje exitoso!\n\n`;
            mensajeCanje += `🎁 Premio canjeado: ${premioSeleccionado.premio}\n`;
            mensajeCanje += `📦 Producto obtenido: ${productoSeleccionado.nombre}\n`;
            mensajeCanje += `🏪 Negocio: ${negocioActual.nombre}\n`;
            if (
                productoSeleccionado.descuento &&
                productoSeleccionado.descuento > 0
            ) {
                mensajeCanje += `🎫 Descuento aplicado: ${productoSeleccionado.descuento}%\n`;
            }
            mensajeCanje += `\n🔑 Código de canje: ${codigo}\n\n`;
            mensajeCanje += `📱 Presenta este código en el negocio para obtener tu producto.`;

            setMensaje(mensajeCanje);

            // Recargar datos
            setTimeout(() => {
                setMensaje("");
                window.location.reload();
            }, 8000);
        } catch (error) {
            console.error("Error:", error);
            setMensaje("❌ Error al canjear el producto");
        }

        setMostrarConfirmacion(false);
        setProductoSeleccionado(null);
        setPremioSeleccionado(null);
        setNegocioActual(null);
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="form-container" style={{ textAlign: "center" }}>
                    <h3>🔄 Cargando tus premios...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* SECCIÓN EXPLICATIVA */}
            <div className="app-explanation">
                <h1>🎁 Canjea tus Premios</h1>
                <p className="subtitle">
                    ¡Canjea los premios que has ganado en las ruletas!
                </p>
                <div
                    className="description"
                    style={{ maxWidth: "600px", margin: "0 auto" }}
                >
                    <p>
                        ✅ <strong>¿Cómo funciona?</strong>
                    </p>
                    <p>
                        1. Gira la ruleta en cualquier negocio y gana premios
                        exclusivos.
                    </p>
                    <p>
                        2. Cada premio que ganes estará disponible para canjear
                        en ese mismo negocio.
                    </p>
                    <p>
                        3. Selecciona un producto y elige qué premio quieres
                        usar.
                    </p>
                    <p>4. Confirma el canje y obtén un código único.</p>
                    <p>
                        5. Presenta el código en el negocio para obtener tu
                        producto o descuento.
                    </p>
                </div>
                <div className="app-features">
                    <span className="feature">🎡 Gira la ruleta</span>
                    <span className="feature">🎁 Gana premios</span>
                    <span className="feature">🛍️ Canjea productos</span>
                    <span className="feature">💾 Recibe tu código</span>
                </div>
            </div>

            {/* Botón para dueños */}
            {esDueno && (
                <div style={{ textAlign: "center", marginBottom: "20px" }}>
                    <button
                        className="btn-gestion-productos"
                        onClick={() => navigate("/gestion-productos")}
                    >
                        📦 Gestionar productos de mi negocio
                    </button>
                </div>
            )}

            {mensaje && (
                <div className="mensaje-flotante">
                    <p>{mensaje}</p>
                </div>
            )}

            {/* Mensaje si no tiene premios */}
            {negociosData.length === 0 && (
                <div className="form-container" style={{ textAlign: "center" }}>
                    <h3>🎯 No tienes premios pendientes</h3>
                    <p>
                        Participa en las ruletas de los negocios para ganar
                        premios increíbles
                    </p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate("/")}
                    >
                        Ir al Dashboard
                    </button>
                </div>
            )}

            {/* Mostrar productos por negocio */}
            {negociosData.map((negocio) => (
                <div key={negocio.id} className="negocio-seccion">
                    <div className="negocio-header">
                        <div className="negocio-header-info">
                            {negocio.logo && (
                                <img
                                    src={negocio.logo}
                                    alt={negocio.nombre}
                                    className="negocio-header-logo"
                                />
                            )}
                            <div>
                                <h2>{negocio.nombre}</h2>
                                <p className="negocio-categoria">
                                    {negocio.categoria}
                                </p>
                            </div>
                        </div>
                        <div className="premios-disponibles">
                            <h4>🎁 Tus premios disponibles:</h4>
                            <div className="premios-tags">
                                {negocio.premios.map((premio, idx) => (
                                    <span key={idx} className="premio-tag">
                                        🎫 {premio.premio}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="business-grid">
                        {negocio.productos.map((producto, idx) => (
                            <div key={idx} className="business-card">
                                <div className="business-card-header">
                                    {producto.imagenURL && (
                                        <img
                                            src={producto.imagenURL}
                                            alt={producto.nombre}
                                            className="producto-card-img"
                                        />
                                    )}
                                    <h3>{producto.nombre}</h3>
                                    <span className="category">
                                        Producto disponible
                                    </span>
                                </div>
                                <div className="business-card-body">
                                    <p className="producto-descripcion">
                                        {producto.descripcion}
                                    </p>
                                    {producto.precio && (
                                        <p className="producto-precio">
                                            💰 Precio: {producto.precio}
                                        </p>
                                    )}
                                    {producto.descuento &&
                                        producto.descuento > 0 && (
                                            <p className="producto-descuento">
                                                🎫 Descuento:{" "}
                                                {producto.descuento}%
                                            </p>
                                        )}
                                    <p className="producto-stock">
                                        📦 Stock:{" "}
                                        {producto.stock === 0
                                            ? "Ilimitado"
                                            : producto.stock}
                                    </p>

                                    {/* Dropdown para seleccionar premio */}
                                    <div className="selector-premio">
                                        <label>Selecciona tu premio:</label>
                                        <select
                                            id={`premio-${negocio.id}-${producto.id}`}
                                            className="premio-select"
                                            defaultValue=""
                                        >
                                            <option value="" disabled>
                                                -- Elige un premio --
                                            </option>
                                            {negocio.premios.map(
                                                (premio, pIdx) => (
                                                    <option
                                                        key={pIdx}
                                                        value={pIdx}
                                                    >
                                                        🎫 {premio.premio} -
                                                        Ganado el{" "}
                                                        {premio.timestamp
                                                            ?.toDate
                                                            ? new Date(
                                                                  premio.timestamp.toDate(),
                                                              ).toLocaleDateString()
                                                            : new Date(
                                                                  premio.timestamp,
                                                              ).toLocaleDateString()}
                                                    </option>
                                                ),
                                            )}
                                        </select>
                                    </div>
                                </div>
                                <div className="business-card-footer">
                                    <button
                                        className="play-button"
                                        onClick={() => {
                                            const select =
                                                document.getElementById(
                                                    `premio-${negocio.id}-${producto.id}`,
                                                );
                                            const selectedIndex = select.value;
                                            if (
                                                selectedIndex &&
                                                selectedIndex !== ""
                                            ) {
                                                const premio =
                                                    negocio.premios[
                                                        parseInt(selectedIndex)
                                                    ];
                                                abrirConfirmacion(
                                                    producto,
                                                    premio,
                                                    negocio,
                                                );
                                            } else {
                                                setMensaje(
                                                    "❌ Por favor selecciona un premio para canjear",
                                                );
                                                setTimeout(
                                                    () => setMensaje(""),
                                                    3000,
                                                );
                                            }
                                        }}
                                        style={{
                                            background:
                                                "linear-gradient(135deg, #00b4d8, #0077b6)",
                                        }}
                                    >
                                        🎫 Canjear Producto
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Modal de confirmación */}
            {mostrarConfirmacion &&
                productoSeleccionado &&
                premioSeleccionado &&
                negocioActual && (
                    <div className="modal-overlay">
                        <div className="modal-confirm">
                            <h3>🎫 Confirmar canje</h3>
                            <p>
                                ¿Deseas canjear el siguiente premio por este
                                producto?
                            </p>
                            <div
                                style={{
                                    background: "rgba(255,255,255,0.1)",
                                    padding: "15px",
                                    borderRadius: "12px",
                                    margin: "15px 0",
                                }}
                            >
                                <p>
                                    <strong>🎁 Premio a canjear:</strong>{" "}
                                    {premioSeleccionado.premio}
                                </p>
                                <p>
                                    <strong>📦 Producto a obtener:</strong>{" "}
                                    {productoSeleccionado.nombre}
                                </p>
                                <p>
                                    <strong>🏪 Negocio:</strong>{" "}
                                    {negocioActual.nombre}
                                </p>
                                {productoSeleccionado.descuento > 0 && (
                                    <p>
                                        <strong>🎫 Descuento aplicado:</strong>{" "}
                                        {productoSeleccionado.descuento}%
                                    </p>
                                )}
                            </div>
                            <div className="modal-actions">
                                <button
                                    className="btn-danger"
                                    onClick={confirmarCanje}
                                >
                                    Sí, canjear
                                </button>
                                <button
                                    className="btn-secundario"
                                    onClick={() =>
                                        setMostrarConfirmacion(false)
                                    }
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    );
}

export default Canjear;
