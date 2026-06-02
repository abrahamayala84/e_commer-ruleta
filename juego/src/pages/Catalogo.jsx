import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

function Catalogo() {
    const { id, premioId } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [premio, setPremio] = useState(null);
    const [loading, setLoading] = useState(true);
    const [codigoDescuento, setCodigoDescuento] = useState("");
    const [mensaje, setMensaje] = useState("");

    useEffect(() => {
        const loadData = async () => {
            try {
                const docRef = doc(db, "negocios", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBusiness(data);

                    const premiosList = data.prizes || data.premios || [];
                    const premioEncontrado = premiosList[premioId];
                    setPremio(premioEncontrado);

                    const nombreNegocio = data.name || data.nombre || "NEG";
                    const codigo = `${nombreNegocio.substring(0, 3).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
                    setCodigoDescuento(codigo);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id, premioId]);

    const aplicarDescuento = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                navigate("/login");
                return;
            }

            const docRef = doc(db, "negocios", id);
            await updateDoc(docRef, {
                descuentosAplicados: arrayUnion({
                    usuarioId: user.uid,
                    usuarioEmail: user.email,
                    codigo: codigoDescuento,
                    premio: premio?.nombre,
                    aplicadoEn: new Date(),
                    usado: false,
                }),
            });

            setMensaje(
                `✅ ¡Código aplicado! Muestra este código en el negocio: ${codigoDescuento}`,
            );

            setTimeout(() => {
                navigate("/canjear");
            }, 3000);
        } catch (error) {
            console.error("Error:", error);
            setMensaje("❌ Error al aplicar el descuento");
        }
    };

    const contactarVendedor = () => {
        const telefono = business?.phone || business?.telefonos;
        const mensajeWhatsApp = `Hola, vi su negocio ${business?.name || business?.nombre} en Ruleta App y me interesa sus productos.`;

        if (telefono) {
            window.open(
                `https://wa.me/${telefono}?text=${encodeURIComponent(mensajeWhatsApp)}`,
                "_blank",
            );
        } else {
            alert("El negocio no tiene teléfono registrado");
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="form-container" style={{ textAlign: "center" }}>
                    <h3>🔄 Cargando catálogo...</h3>
                </div>
            </div>
        );
    }

    const categoria = (
        business?.category ||
        business?.genero ||
        ""
    ).toLowerCase();
    const esRestaurante =
        categoria.includes("restaurante") || categoria.includes("comida");
    const esTienda =
        categoria.includes("tienda") || categoria.includes("productos");

    return (
        <div className="catalogo-container">
            <div className="catalogo-header">
                {business?.logoURL && (
                    <img
                        src={business.logoURL}
                        alt={business.name}
                        className="catalogo-logo"
                    />
                )}
                <h1>{business?.name || business?.nombre}</h1>
                <p className="catalogo-direccion">
                    📍 {business?.address || business?.direccion}
                </p>

                <div className="premio-ganado-banner">
                    <h3>🎉 ¡Felicidades! Ganaste: {premio?.nombre}</h3>
                    {premio?.disponibles > 0 && (
                        <p>Quedan {premio.disponibles} disponibles</p>
                    )}
                </div>
            </div>

            <div className="catalogo-section">
                <h2>
                    {esRestaurante
                        ? "🍽️ Nuestro Menú"
                        : esTienda
                          ? "🛍️ Nuestros Productos"
                          : "📋 Nuestros Servicios"}
                </h2>

                <div className="productos-grid">
                    {esRestaurante ? (
                        <>
                            <ProductoCard
                                nombre="Pizza Margherita"
                                descripcion="Salsa de tomate, mozzarella, albahaca fresca"
                                precio="$180"
                                imagen="https://via.placeholder.com/150"
                                esRestaurante={true}
                            />
                            <ProductoCard
                                nombre="Pasta Alfredo"
                                descripcion="Crema, parmesano, pollo"
                                precio="$160"
                                imagen="https://via.placeholder.com/150"
                                esRestaurante={true}
                            />
                            <ProductoCard
                                nombre="Ensalada César"
                                descripcion="Lechuga, crutones, pollo, aderezo César"
                                precio="$120"
                                imagen="https://via.placeholder.com/150"
                                esRestaurante={true}
                            />
                            <ProductoCard
                                nombre="Tiramisú"
                                descripcion="Postre italiano con café y mascarpone"
                                precio="$80"
                                imagen="https://via.placeholder.com/150"
                                esRestaurante={true}
                            />
                        </>
                    ) : esTienda ? (
                        <>
                            <ProductoCard
                                nombre="Producto 1"
                                descripcion="Descripción del producto 1"
                                precio="$100"
                                imagen="https://via.placeholder.com/150"
                                esRestaurante={false}
                            />
                            <ProductoCard
                                nombre="Producto 2"
                                descripcion="Descripción del producto 2"
                                precio="$200"
                                imagen="https://via.placeholder.com/150"
                                esRestaurante={false}
                            />
                            <ProductoCard
                                nombre="Producto 3"
                                descripcion="Descripción del producto 3"
                                precio="$150"
                                imagen="https://via.placeholder.com/150"
                                esRestaurante={false}
                            />
                        </>
                    ) : (
                        <>
                            <ServicioCard
                                nombre="Consulta"
                                descripcion="Asesoría personalizada"
                                duracion="1 hora"
                            />
                            <ServicioCard
                                nombre="Mantenimiento"
                                descripcion="Servicio técnico especializado"
                                duracion="2 horas"
                            />
                        </>
                    )}
                </div>
            </div>

            <div className="catalogo-actions">
                <button className="btn-descuento" onClick={aplicarDescuento}>
                    🎫 Aplicar mi descuento
                </button>
                <button className="btn-contactar" onClick={contactarVendedor}>
                    📞 Contactar al vendedor
                </button>
                <button
                    className="btn-volver"
                    onClick={() => navigate(`/ruleta/${id}`)}
                >
                    🎡 Volver a la ruleta
                </button>
            </div>

            {mensaje && (
                <div className="mensaje-flotante">
                    <p>{mensaje}</p>
                </div>
            )}
        </div>
    );
}

function ProductoCard({ nombre, descripcion, precio, imagen, esRestaurante }) {
    return (
        <div className="producto-card">
            <img src={imagen} alt={nombre} className="producto-imagen" />
            <div className="producto-info">
                <h3>{nombre}</h3>
                <p className="producto-descripcion">{descripcion}</p>
                <p className="producto-precio">{precio}</p>
                {esRestaurante && (
                    <button className="btn-pedir">🍽️ Ordenar</button>
                )}
            </div>
        </div>
    );
}

function ServicioCard({ nombre, descripcion, duracion }) {
    return (
        <div className="servicio-card">
            <div className="servicio-info">
                <h3>{nombre}</h3>
                <p>{descripcion}</p>
                <p className="servicio-duracion">⏱️ {duracion}</p>
                <button className="btn-solicitar">📅 Solicitar</button>
            </div>
        </div>
    );
}

export default Catalogo;
