import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../firebase";
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    getDoc,
} from "firebase/firestore";
import {
    ref,
    uploadBytes,
    getDownloadURL,
    deleteObject,
} from "firebase/storage";

function GestionProductos() {
    const navigate = useNavigate();
    const [misNegocios, setMisNegocios] = useState([]);
    const [negocioSeleccionado, setNegocioSeleccionado] = useState(null);
    const [productos, setProductos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [editandoProducto, setEditandoProducto] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [subiendo, setSubiendo] = useState(false);
    const [confirmarEliminacion, setConfirmarEliminacion] = useState(null);

    const [formData, setFormData] = useState({
        nombre: "",
        descripcion: "",
        precio: "",
        descuento: "",
        imagen: null,
        imagenPreview: null,
        stock: 0,
        categoria: "",
    });

    useEffect(() => {
        const loadMisNegocios = async () => {
            const user = auth.currentUser;
            if (!user) {
                navigate("/login");
                return;
            }

            try {
                const negociosRef = collection(db, "negocios");
                const q = query(negociosRef, where("userId", "==", user.uid));
                const querySnapshot = await getDocs(q);

                const negocios = [];
                querySnapshot.forEach((doc) => {
                    negocios.push({ id: doc.id, ...doc.data() });
                });

                setMisNegocios(negocios);
            } catch (error) {
                console.error("Error:", error);
                setMensaje("Error al cargar tus negocios");
            } finally {
                setLoading(false);
            }
        };

        loadMisNegocios();
    }, [navigate]);

    const cargarProductos = async (negocioId) => {
        try {
            const negocioRef = doc(db, "negocios", negocioId);
            const docSnap = await getDoc(negocioRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                setProductos(data.productos || []);
                setNegocioSeleccionado({ id: negocioId, ...data });
            }
        } catch (error) {
            console.error("Error al cargar productos:", error);
            setMensaje("Error al cargar los productos");
        }
    };

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({
                ...formData,
                imagen: file,
                imagenPreview: URL.createObjectURL(file),
            });
        }
    };

    const subirImagen = async (negocioId, productoId) => {
        if (!formData.imagen) return null;

        const imageRef = ref(storage, `productos/${negocioId}/${productoId}`);
        await uploadBytes(imageRef, formData.imagen);
        return await getDownloadURL(imageRef);
    };

    const guardarProducto = async () => {
        if (!negocioSeleccionado) return;

        if (!formData.nombre.trim()) {
            setMensaje("❌ El nombre del producto es obligatorio");
            setTimeout(() => setMensaje(""), 3000);
            return;
        }

        setSubiendo(true);

        try {
            let productosActualizados = [...productos];

            if (editandoProducto) {
                const index = productosActualizados.findIndex(
                    (p) => p.id === editandoProducto.id,
                );
                if (index === -1) {
                    setMensaje("❌ Producto no encontrado");
                    setSubiendo(false);
                    return;
                }

                let imagenURL = editandoProducto.imagenURL || null;

                if (formData.imagen) {
                    if (editandoProducto.imagenURL) {
                        try {
                            const oldImageRef = ref(
                                storage,
                                `productos/${negocioSeleccionado.id}/${editandoProducto.id}`,
                            );
                            await deleteObject(oldImageRef);
                        } catch (err) {
                            console.log(
                                "No se pudo eliminar imagen vieja:",
                                err,
                            );
                        }
                    }
                    imagenURL = await subirImagen(
                        negocioSeleccionado.id,
                        editandoProducto.id,
                    );
                }

                productosActualizados[index] = {
                    ...productosActualizados[index],
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    precio: formData.precio,
                    descuento: formData.descuento,
                    imagenURL: imagenURL,
                    stock: parseInt(formData.stock) || 0,
                    categoria: formData.categoria,
                    actualizado: new Date().toISOString(),
                };
            } else {
                const nuevoId = Date.now().toString();
                let imagenURL = null;

                if (formData.imagen) {
                    imagenURL = await subirImagen(
                        negocioSeleccionado.id,
                        nuevoId,
                    );
                }

                const nuevoProducto = {
                    id: nuevoId,
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    precio: formData.precio,
                    descuento: formData.descuento,
                    imagenURL: imagenURL,
                    stock: parseInt(formData.stock) || 0,
                    categoria: formData.categoria,
                    creado: new Date().toISOString(),
                };

                productosActualizados.push(nuevoProducto);
            }

            const negocioRef = doc(db, "negocios", negocioSeleccionado.id);
            await updateDoc(negocioRef, { productos: productosActualizados });

            setProductos(productosActualizados);
            setMostrarFormulario(false);
            setEditandoProducto(null);
            resetFormulario();
            setMensaje(
                editandoProducto
                    ? "✅ Producto actualizado"
                    : "✅ Producto agregado",
            );
            setTimeout(() => setMensaje(""), 3000);
        } catch (error) {
            console.error("Error:", error);
            setMensaje("❌ Error al guardar el producto: " + error.message);
        } finally {
            setSubiendo(false);
        }
    };

    const eliminarProducto = (producto) => {
        setConfirmarEliminacion(producto);
    };

    const confirmarEliminacionProducto = async () => {
        if (!confirmarEliminacion) return;

        const producto = confirmarEliminacion;

        try {
            if (producto.imagenURL) {
                try {
                    const imageRef = ref(
                        storage,
                        `productos/${negocioSeleccionado.id}/${producto.id}`,
                    );
                    await deleteObject(imageRef);
                } catch (err) {
                    console.log("No se pudo eliminar la imagen:", err);
                }
            }

            const productosActualizados = productos.filter(
                (p) => p.id !== producto.id,
            );
            const negocioRef = doc(db, "negocios", negocioSeleccionado.id);
            await updateDoc(negocioRef, { productos: productosActualizados });

            setProductos(productosActualizados);
            setMensaje("✅ Producto eliminado");
            setTimeout(() => setMensaje(""), 3000);
        } catch (error) {
            console.error("Error:", error);
            setMensaje("❌ Error al eliminar el producto");
        } finally {
            setConfirmarEliminacion(null);
        }
    };

    const editarProducto = (producto) => {
        setEditandoProducto(producto);
        setFormData({
            nombre: producto.nombre || "",
            descripcion: producto.descripcion || "",
            precio: producto.precio || "",
            descuento: producto.descuento || "",
            imagen: null,
            imagenPreview: producto.imagenURL || null,
            stock: producto.stock || 0,
            categoria: producto.categoria || "",
        });
        setMostrarFormulario(true);
    };

    const resetFormulario = () => {
        setFormData({
            nombre: "",
            descripcion: "",
            precio: "",
            descuento: "",
            imagen: null,
            imagenPreview: null,
            stock: 0,
            categoria: "",
        });
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="form-container" style={{ textAlign: "center" }}>
                    <h3>🔄 Cargando...</h3>
                </div>
            </div>
        );
    }

    if (misNegocios.length === 0) {
        return (
            <div className="dashboard-container">
                <div className="form-container" style={{ textAlign: "center" }}>
                    <h3>📭 No tienes negocios registrados</h3>
                    <p>
                        Para gestionar productos, primero debes crear un negocio
                    </p>
                    <button
                        className="btn-primary"
                        onClick={() => navigate("/agregar")}
                    >
                        + Crear negocio
                    </button>
                </div>
            </div>
        );
    }

    if (!negocioSeleccionado) {
        return (
            <div className="dashboard-container">
                <div className="app-explanation">
                    <h1>📦 Gestión de Productos</h1>
                    <p>
                        Selecciona un negocio para gestionar sus productos y
                        descuentos
                    </p>
                </div>
                <div className="business-grid">
                    {misNegocios.map((negocio) => (
                        <div
                            key={negocio.id}
                            className="business-card"
                            onClick={() => cargarProductos(negocio.id)}
                        >
                            <div className="business-card-header">
                                {negocio.logoURL ? (
                                    <img
                                        src={negocio.logoURL}
                                        alt={negocio.name}
                                        className="business-logo"
                                    />
                                ) : (
                                    <div className="business-logo-placeholder">
                                        🏪
                                    </div>
                                )}
                                <h3>{negocio.name || negocio.nombre}</h3>
                                <span className="category">
                                    {negocio.category || negocio.genero}
                                </span>
                            </div>
                            <div className="business-card-footer">
                                <button className="play-button">
                                    📦 Gestionar Productos
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="app-explanation">
                <button
                    className="btn-volver"
                    onClick={() => setNegocioSeleccionado(null)}
                >
                    ← Volver a mis negocios
                </button>
                <h1>
                    📦 {negocioSeleccionado.name || negocioSeleccionado.nombre}
                </h1>
                <p>Gestiona los productos y descuentos para canje</p>
            </div>

            {mensaje && (
                <div className="mensaje-flotante">
                    <p>{mensaje}</p>
                </div>
            )}

            <button
                className="add-business-btn"
                onClick={() => {
                    resetFormulario();
                    setEditandoProducto(null);
                    setMostrarFormulario(true);
                }}
            >
                + Agregar producto / descuento
            </button>

            {mostrarFormulario && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>
                            {editandoProducto
                                ? "✏️ Editar Producto"
                                : "➕ Nuevo Producto"}
                        </h2>

                        <div className="form-group">
                            <label>Nombre del producto *</label>
                            <input
                                type="text"
                                placeholder="Ej: Pizza Margherita"
                                value={formData.nombre}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        nombre: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                placeholder="Descripción del producto o servicio"
                                value={formData.descripcion}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        descripcion: e.target.value,
                                    })
                                }
                                rows="3"
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Precio original</label>
                                <input
                                    type="text"
                                    placeholder="$0.00"
                                    value={formData.precio}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            precio: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label>Descuento (%)</label>
                                <input
                                    type="number"
                                    placeholder="10"
                                    value={formData.descuento}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            descuento: e.target.value,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Categoría</label>
                                <input
                                    type="text"
                                    placeholder="Comida, Bebida, Servicio..."
                                    value={formData.categoria}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            categoria: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="form-group">
                                <label>Stock disponible</label>
                                <input
                                    type="number"
                                    placeholder="0 = ilimitado"
                                    value={formData.stock}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            stock:
                                                parseInt(e.target.value) || 0,
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Imagen del producto</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImagenChange}
                            />
                            {formData.imagenPreview && (
                                <div className="imagen-preview">
                                    <img
                                        src={formData.imagenPreview}
                                        alt="Preview"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                className="btn-primary"
                                onClick={guardarProducto}
                                disabled={subiendo}
                            >
                                {subiendo
                                    ? "⏳ Guardando..."
                                    : editandoProducto
                                      ? "Actualizar"
                                      : "Guardar"}
                            </button>
                            <button
                                className="btn-secundario"
                                onClick={() => {
                                    setMostrarFormulario(false);
                                    setEditandoProducto(null);
                                    resetFormulario();
                                }}
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de confirmación de eliminación */}
            {confirmarEliminacion && (
                <div className="modal-overlay">
                    <div className="modal-confirm">
                        <h3>⚠️ Confirmar eliminación</h3>
                        <p>
                            ¿Estás seguro de que deseas eliminar{" "}
                            <strong>"{confirmarEliminacion.nombre}"</strong>?
                        </p>
                        <p style={{ color: "#f15bb5", fontSize: "0.9rem" }}>
                            Esta acción no se puede deshacer.
                        </p>
                        <div className="modal-actions">
                            <button
                                className="btn-danger"
                                onClick={confirmarEliminacionProducto}
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

            <div className="productos-gestion-grid">
                {productos.map((producto) => (
                    <div key={producto.id} className="producto-gestion-card">
                        {producto.imagenURL && (
                            <img
                                src={producto.imagenURL}
                                alt={producto.nombre}
                                className="producto-gestion-img"
                            />
                        )}
                        <div className="producto-gestion-info">
                            <h3>{producto.nombre}</h3>
                            <p className="producto-desc">
                                {producto.descripcion}
                            </p>
                            {producto.precio && (
                                <p className="producto-precio">
                                    💰 Precio: {producto.precio}
                                </p>
                            )}
                            {producto.descuento && producto.descuento > 0 && (
                                <p className="producto-descuento">
                                    🎫 Descuento: {producto.descuento}%
                                </p>
                            )}
                            <p className="producto-stock">
                                📦 Stock:{" "}
                                {producto.stock === 0
                                    ? "Ilimitado"
                                    : producto.stock}
                            </p>
                        </div>
                        <div className="producto-gestion-actions">
                            <button
                                className="btn-editar"
                                onClick={() => editarProducto(producto)}
                            >
                                ✏️ Editar
                            </button>
                            <button
                                className="btn-eliminar"
                                onClick={() => eliminarProducto(producto)}
                            >
                                🗑️ Eliminar
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {productos.length === 0 && (
                <div className="form-container" style={{ textAlign: "center" }}>
                    <h3>📭 No hay productos</h3>
                    <p>Agrega tu primer producto o descuento</p>
                </div>
            )}
        </div>
    );
}

export default GestionProductos;
