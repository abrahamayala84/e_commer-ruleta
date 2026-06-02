import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth, storage } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { updateDoc, doc } from "firebase/firestore";
function Agregar() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageError, setImageError] = useState("");

    const [business, setBusiness] = useState({
        name: "",
        phone: "",
        address: "",
        category: "",
        social: "",
        prizes: Array(8).fill({
            isFollow: false,
            name: "",
            available: 0,
            expiry: "",
        }),
    });

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setImageError("");

        if (file) {
            // Validar tipo de archivo
            if (!file.type.startsWith("image/")) {
                setImageError(
                    "Por favor selecciona una imagen válida (JPG, PNG, GIF)",
                );
                return;
            }

            // Validar tamaño (máximo 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setImageError("La imagen no debe superar los 2MB");
                return;
            }

            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePrizeChange = (index, field, value) => {
        const newPrizes = [...business.prizes];
        newPrizes[index] = { ...newPrizes[index], [field]: value };
        setBusiness({ ...business, prizes: newPrizes });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const user = auth.currentUser;
            if (!user) {
                alert("Debes iniciar sesión");
                navigate("/login");
                return;
            }

            // Validar campos obligatorios
            if (!business.name.trim()) {
                alert("El nombre del negocio es obligatorio");
                setLoading(false);
                return;
            }

            if (!business.category.trim()) {
                alert("La categoría es obligatoria");
                setLoading(false);
                return;
            }

            // Crear documento temporal
            const negocioData = {
                name: business.name.trim(),
                phone: business.phone.trim() || "No especificado",
                address: business.address.trim() || "No especificada",
                category: business.category.trim(),
                social: business.social.trim() || "",
                userId: user.uid,
                userEmail: user.email,
                createdAt: serverTimestamp(),
                historial: [],
                prizes: business.prizes.map((prize) => ({
                    isFollow: prize.isFollow || false,
                    nombre: prize.isFollow
                        ? "Sigue participando"
                        : prize.name.trim() || "Premio",
                    disponibles: prize.isFollow
                        ? 0
                        : Number(prize.available) || 0,
                    expiracion: prize.isFollow
                        ? "Sin expiración"
                        : prize.expiry || "",
                    tipo: prize.isFollow ? "sigue" : "premio",
                })),
            };

            // Guardar en Firestore
            const docRef = await addDoc(
                collection(db, "negocios"),
                negocioData,
            );

            // Subir imagen si existe
            if (selectedImage) {
                const imageRef = ref(
                    storage,
                    `logos/${user.uid}/${docRef.id}/logo.png`,
                );
                await uploadBytes(imageRef, selectedImage);
                const imageUrl = await getDownloadURL(imageRef);
                await updateDoc(doc(db, "negocios", docRef.id), {
                    logoURL: imageUrl,
                });
            }

            alert("✅ ¡Negocio creado exitosamente!");
            navigate("/");
        } catch (error) {
            console.error("Error:", error);
            alert(`❌ Error: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    // Helper para obtener fecha actual en formato YYYY-MM-DD
    const getTodayDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
    };

    return (
        <div className="business-form">
            <h2>Registra tu Empresa</h2>

            <form onSubmit={handleSubmit}>
                {/* ===== SECCIÓN DEL LOGO ===== */}
                <div className="form-section">
                    <h3>📸 Logo del Negocio</h3>
                    <div className="logo-upload-area">
                        <div className="logo-preview">
                            {imagePreview ? (
                                <img
                                    src={imagePreview}
                                    alt="Preview"
                                    className="logo-preview-img"
                                />
                            ) : (
                                <div className="logo-placeholder">🎰</div>
                            )}
                        </div>
                        <div className="logo-upload-controls">
                            <label className="upload-btn">
                                Seleccionar Imagen
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: "none" }}
                                />
                            </label>
                            {imagePreview && (
                                <button
                                    type="button"
                                    className="clear-btn"
                                    onClick={() => {
                                        setSelectedImage(null);
                                        setImagePreview(null);
                                    }}
                                >
                                    Eliminar
                                </button>
                            )}
                            <p className="input-help">
                                Formatos: JPG, PNG, GIF. Máx. 2MB
                            </p>
                            {imageError && (
                                <p className="error-text">{imageError}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* ===== DATOS DEL NEGOCIO ===== */}
                <div className="form-section">
                    <h3>🏪 Datos del Negocio</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Nombre del Negocio *</label>
                            <input
                                type="text"
                                placeholder="Ej: Pizzería Roma"
                                value={business.name}
                                onChange={(e) =>
                                    setBusiness({
                                        ...business,
                                        name: e.target.value,
                                    })
                                }
                                required
                            />
                            <p className="input-help">
                                Nombre comercial que aparecerá en la ruleta
                            </p>
                        </div>
                        <div className="form-group">
                            <label>Categoría *</label>
                            <input
                                type="text"
                                placeholder="Ej: Restaurante, Tienda, Servicios"
                                value={business.category}
                                onChange={(e) =>
                                    setBusiness({
                                        ...business,
                                        category: e.target.value,
                                    })
                                }
                                required
                            />
                            <p className="input-help">
                                Ej: Restaurante, Tienda de Ropa, Servicios
                            </p>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Teléfono</label>
                            <input
                                type="tel"
                                placeholder="Teléfono de contacto"
                                value={business.phone}
                                onChange={(e) =>
                                    setBusiness({
                                        ...business,
                                        phone: e.target.value,
                                    })
                                }
                            />
                            <p className="input-help">
                                Número de contacto para los clientes
                            </p>
                        </div>
                        <div className="form-group">
                            <label>Dirección</label>
                            <input
                                type="text"
                                placeholder="Dirección del negocio"
                                value={business.address}
                                onChange={(e) =>
                                    setBusiness({
                                        ...business,
                                        address: e.target.value,
                                    })
                                }
                            />
                            <p className="input-help">
                                Ubicación física del establecimiento
                            </p>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Redes Sociales (opcional)</label>
                        <input
                            type="url"
                            placeholder="https://facebook.com/tu-negocio"
                            value={business.social}
                            onChange={(e) =>
                                setBusiness({
                                    ...business,
                                    social: e.target.value,
                                })
                            }
                        />
                        <p className="input-help">
                            Facebook, Instagram, WhatsApp o sitio web
                        </p>
                    </div>
                </div>

                {/* ===== PREMIOS DE LA RULETA ===== */}
                <div className="form-section">
                    <h3>🎁 Premios de la Ruleta (8 posiciones)</h3>
                    <p className="section-help">
                        Completa los premios para cada posición de la ruleta.
                        Los clientes ganarán el premio donde caiga la flecha.
                    </p>

                    <div className="prizes-grid">
                        {business.prizes.map((prize, idx) => (
                            <div key={idx} className="prize-card">
                                <h4>Posición {idx + 1}</h4>

                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        id={`follow-${idx}`}
                                        checked={prize.isFollow}
                                        onChange={(e) =>
                                            handlePrizeChange(
                                                idx,
                                                "isFollow",
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <label htmlFor={`follow-${idx}`}>
                                        Marcar como "Sigue participando" (sin
                                        premio)
                                    </label>
                                </div>

                                {!prize.isFollow && (
                                    <>
                                        <div className="form-group">
                                            <label>Nombre del premio</label>
                                            <input
                                                type="text"
                                                placeholder="Ej: 10% de descuento, Producto gratis"
                                                value={prize.name}
                                                onChange={(e) =>
                                                    handlePrizeChange(
                                                        idx,
                                                        "name",
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <p className="input-help">
                                                Ejemplo: "20% de descuento",
                                                "Café gratis"
                                            </p>
                                        </div>

                                        <div className="form-row">
                                            <div className="form-group">
                                                <label>
                                                    Cantidad disponible
                                                </label>
                                                <input
                                                    type="number"
                                                    placeholder="0 = Ilimitado"
                                                    value={prize.available}
                                                    onChange={(e) =>
                                                        handlePrizeChange(
                                                            idx,
                                                            "available",
                                                            parseInt(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    min="0"
                                                />
                                                <p className="input-help">
                                                    Número de premios
                                                    disponibles (0 = sin límite)
                                                </p>
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    Fecha de expiración
                                                </label>
                                                <input
                                                    type="date"
                                                    value={prize.expiry}
                                                    onChange={(e) =>
                                                        handlePrizeChange(
                                                            idx,
                                                            "expiry",
                                                            e.target.value,
                                                        )
                                                    }
                                                    min={getTodayDate()}
                                                />
                                                <p className="input-help">
                                                    Fecha límite para canjear el
                                                    premio
                                                </p>
                                            </div>
                                        </div>
                                    </>
                                )}

                                {prize.isFollow && (
                                    <div className="info-message">
                                        <span>🔄</span>
                                        <p>
                                            Esta posición no dará premio. El
                                            cliente podrá volver a intentar.
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? "⏳ Guardando..." : "💾 Guardar Negocio"}
                </button>
            </form>
        </div>
    );
}

// Función auxiliar para updateDoc (agregar al inicio del archivo)

export default Agregar;
