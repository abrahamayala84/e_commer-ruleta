import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function EditarNegocio() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [business, setBusiness] = useState({
        name: "",
        phone: "",
        address: "",
        category: "",
        social: "",
        logo: null,
        prizes: Array(8).fill({
            isFollow: false,
            name: "",
            available: 0,
            expiry: "",
        }),
    });

    useEffect(() => {
        // Cargar datos del negocio desde Firebase usando el id
        console.log("Cargando negocio:", id);
        // Aquí iría la lógica para cargar los datos existentes
    }, [id]);

    const handlePrizeChange = (index, field, value) => {
        const newPrizes = [...business.prizes];
        newPrizes[index] = { ...newPrizes[index], [field]: value };
        setBusiness({ ...business, prizes: newPrizes });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Negocio actualizado:", business);
        // Actualizar en Firebase
        navigate("/");
    };

    return (
        <div className="business-form">
            <h2>Editar Empresa</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label>Logo</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                                setBusiness({
                                    ...business,
                                    logo: e.target.files[0],
                                })
                            }
                        />
                    </div>
                    <div className="form-group">
                        <label>Nombre</label>
                        <input
                            type="text"
                            placeholder="Nombre del negocio"
                            value={business.name}
                            onChange={(e) =>
                                setBusiness({
                                    ...business,
                                    name: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-group">
                        <label>Teléfonos</label>
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
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Categoría</label>
                        <input
                            type="text"
                            placeholder="Ej. Restaurante, Tienda, Bar"
                            value={business.category}
                            onChange={(e) =>
                                setBusiness({
                                    ...business,
                                    category: e.target.value,
                                })
                            }
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Dirección</label>
                    <input
                        type="text"
                        placeholder="Calle, número, colonia, ciudad"
                        value={business.address}
                        onChange={(e) =>
                            setBusiness({
                                ...business,
                                address: e.target.value,
                            })
                        }
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Redes Sociales (opcional)</label>
                    <input
                        type="url"
                        placeholder="https://facebook.com/..."
                        value={business.social}
                        onChange={(e) =>
                            setBusiness({ ...business, social: e.target.value })
                        }
                    />
                </div>

                <div className="prizes-section">
                    <h3>Premios y Descuentos (8 posiciones)</h3>
                    <div className="prizes-grid">
                        {business.prizes.map((prize, idx) => (
                            <div key={idx} className="prize-card">
                                <h4>Posición {idx + 1}</h4>
                                <div className="checkbox-group">
                                    <input
                                        type="checkbox"
                                        checked={prize.isFollow}
                                        onChange={(e) =>
                                            handlePrizeChange(
                                                idx,
                                                "isFollow",
                                                e.target.checked,
                                            )
                                        }
                                    />
                                    <label>
                                        ¿Es 'Sigue participando'? (sin premio
                                        real)
                                    </label>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Nombre del premio Ej. 10% de descuento"
                                    value={prize.name}
                                    onChange={(e) =>
                                        handlePrizeChange(
                                            idx,
                                            "name",
                                            e.target.value,
                                        )
                                    }
                                    disabled={prize.isFollow}
                                />
                                <input
                                    type="number"
                                    placeholder="Usos disponibles (0 = ilimitado)"
                                    value={prize.available}
                                    onChange={(e) =>
                                        handlePrizeChange(
                                            idx,
                                            "available",
                                            parseInt(e.target.value),
                                        )
                                    }
                                    disabled={prize.isFollow}
                                />
                                <input
                                    type="text"
                                    placeholder="Vigencia (Sin expiración o fecha)"
                                    value={prize.expiry}
                                    onChange={(e) =>
                                        handlePrizeChange(
                                            idx,
                                            "expiry",
                                            e.target.value,
                                        )
                                    }
                                    disabled={prize.isFollow}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <button type="submit" className="submit-btn">
                    Actualizar Negocio
                </button>
            </form>
        </div>
    );
}

export default EditarNegocio; // ✅ Exportación default
