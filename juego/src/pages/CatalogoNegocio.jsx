import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function CatalogoNegocio({ setNegocioId }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadBusiness = async () => {
            try {
                const docRef = doc(db, "negocios", id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBusiness({ id: docSnap.id, ...data });
                    if (setNegocioId) {
                        setNegocioId(id);
                    }
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setLoading(false);
            }
        };
        loadBusiness();
    }, [id, setNegocioId]);

    const contactarVendedor = () => {
        const telefono = business?.phone || business?.telefonos;
        const mensaje = `Hola, vi su negocio ${business?.name || business?.nombre} en el catálogo de Ruleta App y me interesa conocer más sobre sus productos.`;
        if (telefono) {
            window.open(
                `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`,
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

    if (!business) {
        return (
            <div className="dashboard-container">
                <div className="form-container" style={{ textAlign: "center" }}>
                    <h3>❌ Negocio no encontrado</h3>
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

    const categoria = (
        business?.category ||
        business?.genero ||
        ""
    ).toLowerCase();
    const esRestaurante =
        categoria.includes("restaurante") || categoria.includes("comida");
    const esTienda =
        categoria.includes("tienda") || categoria.includes("productos");

    // Obtener productos del negocio
    const productos = business.productos || [];

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
                <p className="catalogo-telefono">
                    📞 {business?.phone || business?.telefonos}
                </p>
            </div>

            <div className="catalogo-section">
                <h2>
                    {esRestaurante
                        ? "🍽️ Nuestro Menú"
                        : esTienda
                          ? "🛍️ Nuestros Productos"
                          : "📋 Nuestros Servicios"}
                </h2>

                {productos.length > 0 ? (
                    <div className="productos-grid">
                        {productos.map((producto, idx) => (
                            <div key={idx} className="producto-card">
                                {producto.imagenURL && (
                                    <img
                                        src={producto.imagenURL}
                                        alt={producto.nombre}
                                        className="producto-imagen"
                                    />
                                )}
                                <div className="producto-info">
                                    <h3>{producto.nombre}</h3>
                                    <p className="producto-descripcion">
                                        {producto.descripcion}
                                    </p>
                                    {producto.precio && (
                                        <p className="producto-precio">
                                            💰 {producto.precio}
                                        </p>
                                    )}
                                    {producto.descuento &&
                                        producto.descuento > 0 && (
                                            <p className="producto-descuento">
                                                🎫 Descuento:{" "}
                                                {producto.descuento}%
                                            </p>
                                        )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div
                        className="form-container"
                        style={{ textAlign: "center" }}
                    >
                        <h3>📭 No hay productos disponibles</h3>
                        <p>Pronto agregaremos más productos</p>
                    </div>
                )}
            </div>

            <div className="catalogo-actions">
                <button className="btn-contactar" onClick={contactarVendedor}>
                    📞 Contactar al vendedor
                </button>
                <button
                    className="btn-volver"
                    onClick={() => navigate(`/ruleta/${id}`)}
                >
                    🎡 Ir a la ruleta
                </button>
                <button className="btn-volver" onClick={() => navigate("/")}>
                    🏠 Volver al inicio
                </button>
            </div>
        </div>
    );
}

export default CatalogoNegocio;
