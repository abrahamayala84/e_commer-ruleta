// functions/index.js
// Cloud Function de Firebase — el backend decide el ganador, no el frontend
//
// Deploy: firebase deploy --only functions
// Requiere: firebase init functions (Node.js 18)

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { v4: uuidv4 } = require("uuid");

initializeApp();
const db = getFirestore();

/**
 * girarRuleta — callable function
 *
 * El cliente solo manda { negocioId }
 * El servidor:
 *   1. Verifica que el usuario esté autenticado
 *   2. Verifica que tenga tiros disponibles
 *   3. Elige el ganador aleatoriamente (aquí, no en el frontend)
 *   4. Escribe todo en Firestore con una transacción atómica
 *   5. Devuelve el resultado al cliente
 */
exports.girarRuleta = onCall(
    {
        region: "us-central1",
        enforceAppCheck: false, // Ponlo en true si usas Firebase App Check
    },
    async (request) => {
        // 1. Autenticación obligatoria
        if (!request.auth) {
            throw new HttpsError(
                "unauthenticated",
                "Debes iniciar sesión para girar la ruleta.",
            );
        }

        const usuarioId = request.auth.uid;
        const { negocioId } = request.data;

        if (!negocioId || typeof negocioId !== "string") {
            throw new HttpsError(
                "invalid-argument",
                "negocioId es requerido.",
            );
        }

        const usuarioRef = db.collection("usuarios").doc(usuarioId);
        const negocioRef = db.collection("negocios").doc(negocioId);
        const girosRef = db.collection("giros");

        try {
            const resultado = await db.runTransaction(async (transaction) => {
                // --- LECTURAS PRIMERO ---
                const [usuarioSnap, negocioSnap] = await Promise.all([
                    transaction.get(usuarioRef),
                    transaction.get(negocioRef),
                ]);

                if (!usuarioSnap.exists) {
                    throw new HttpsError(
                        "not-found",
                        "Usuario no encontrado.",
                    );
                }
                if (!negocioSnap.exists) {
                    throw new HttpsError(
                        "not-found",
                        "Negocio no encontrado.",
                    );
                }

                const usuario = usuarioSnap.data();
                const tiros = usuario.tirosRestantes || 0;

                if (tiros < 1) {
                    throw new HttpsError(
                        "resource-exhausted",
                        "No tienes tiros suficientes. Compra más en tu perfil.",
                    );
                }

                const negocio = negocioSnap.data();
                const premios = negocio.premios || [];

                if (premios.length === 0) {
                    throw new HttpsError(
                        "failed-precondition",
                        "Este negocio no tiene premios configurados.",
                    );
                }

                // 2. Filtrar premios disponibles (con usos y sin expirar)
                const ahora = new Date();
                const disponibles = premios
                    .map((p, i) => ({ ...p, _index: i }))
                    .filter((p) => {
                        const tieneUsos =
                            p.usosRestantes === Infinity ||
                            p.usosRestantes > 0;
                        const noExpirado =
                            !p.expiracion ||
                            p.expiracion.toDate() > ahora;
                        return tieneUsos && noExpirado;
                    });

                if (disponibles.length === 0) {
                    throw new HttpsError(
                        "failed-precondition",
                        "Todos los premios están agotados o expirados.",
                    );
                }

                // 3. EL BACKEND elige el ganador (aleatoriedad segura)
                const ganadorIdx = Math.floor(
                    Math.random() * disponibles.length,
                );
                const premioGanado = disponibles[ganadorIdx];
                const indicePremio = premioGanado._index;

                // --- ESCRITURAS ---
                // Descontar tiro
                transaction.update(usuarioRef, {
                    tirosRestantes: FieldValue.increment(-1),
                });

                // Descontar uso del premio si no es ilimitado
                if (premioGanado.usosRestantes !== Infinity) {
                    const premiosActualizados = [...premios];
                    premiosActualizados[indicePremio] = {
                        ...premiosActualizados[indicePremio],
                        usosRestantes: premioGanado.usosRestantes - 1,
                    };
                    transaction.update(negocioRef, {
                        premios: premiosActualizados,
                    });
                }

                // Registrar el giro
                const nuevoGiroRef = girosRef.doc();
                transaction.set(nuevoGiroRef, {
                    usuarioId,
                    negocioId,
                    premioObtenido: premioGanado.nombre,
                    tipoPremio: premioGanado.tipo,
                    indicePremio,
                    fechaGiro: new Date(),
                    expiracionPremio: premioGanado.expiracion || null,
                    canjeado: false,
                    codigoCanje:
                        premioGanado.tipo === "real" ? uuidv4() : null,
                });

                return {
                    indicePremio,
                    nombrePremio: premioGanado.nombre,
                    tipoPremio: premioGanado.tipo,
                    giroId: nuevoGiroRef.id,
                };
            });

            return resultado;
        } catch (err) {
            // Si ya es un HttpsError lo relanzamos tal cual
            if (err instanceof HttpsError) throw err;
            console.error("Error en girarRuleta:", err);
            throw new HttpsError("internal", "Error interno del servidor.");
        }
    },
);
