// src/services/userServices.jsx
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    deleteUser,
} from "firebase/auth";
import {
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    updateDoc,
    writeBatch,
    deleteDoc,
    increment,
} from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth, db } from "../firebase";
import { v4 as uuidv4 } from "uuid";

// ============================================
// Autenticación
// ============================================

export const creaUsuario = async (name, email, password) => {
    const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
    );
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, "usuarios", user.uid), {
        uid: user.uid,
        name,
        email,
        fechaRegistro: new Date(),
        tirosRestantes: 0,
    });
    return { success: true, user };
};

export const loginUsuario = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
    );
    return { success: true, user: userCredential.user };
};

export const logoutUsuario = async () => {
    await signOut(auth);
    return { success: true };
};

export const eliminarCuenta = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");

    const girosQuery = query(
        collection(db, "giros"),
        where("usuarioId", "==", user.uid),
    );
    const girosSnapshot = await getDocs(girosQuery);
    const batch = writeBatch(db);
    girosSnapshot.forEach((d) => batch.delete(d.ref));

    const negociosQuery = query(
        collection(db, "negocios"),
        where("creadoPor", "==", user.uid),
    );
    const negociosSnapshot = await getDocs(negociosQuery);
    negociosSnapshot.forEach((d) => batch.delete(d.ref));

    const userDocRef = doc(db, "usuarios", user.uid);
    batch.delete(userDocRef);

    await batch.commit();
    await deleteUser(user);
};

// ============================================
// Gestión de Tiros
// ============================================

export const getTirosRestantes = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const userDoc = await getDoc(doc(db, "usuarios", user.uid));
    return userDoc.data()?.tirosRestantes || 0;
};

export const comprarPaquete = async (cantidadPaquetes = 1) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const tirosPorPaquete = 5;
    const totalTiros = cantidadPaquetes * tirosPorPaquete;

    // TODO: Integrar pago real (MercadoPago/OXXO) antes de sumar los tiros.
    // Por ahora simula el pago exitoso:
    const userRef = doc(db, "usuarios", user.uid);
    await updateDoc(userRef, {
        tirosRestantes: increment(totalTiros),
    });
    return { success: true, tirosAgregados: totalTiros };
};

// ============================================
// Negocios
// ============================================

export const crearNegocio = async (negocioData) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const { addDoc } = await import("firebase/firestore");
    const docRef = await addDoc(collection(db, "negocios"), {
        ...negocioData,
        creadoPor: user.uid,
        fechaCreacion: new Date(),
    });
    return { id: docRef.id, ...negocioData };
};

export const getNegocios = async () => {
    const querySnapshot = await getDocs(collection(db, "negocios"));
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getNegocioById = async (negocioId) => {
    const docRef = doc(db, "negocios", negocioId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) throw new Error("Negocio no encontrado");
    return { id: docSnap.id, ...docSnap.data() };
};

export const getMisNegocios = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const q = query(
        collection(db, "negocios"),
        where("creadoPor", "==", user.uid),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const actualizarNegocio = async (negocioId, nuevosDatos) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const negocioRef = doc(db, "negocios", negocioId);
    const negocioSnap = await getDoc(negocioRef);
    if (!negocioSnap.exists()) throw new Error("El negocio no existe");
    if (negocioSnap.data().creadoPor !== user.uid) {
        throw new Error("No tienes permiso para editar este negocio");
    }
    await updateDoc(negocioRef, nuevosDatos);
    return { success: true };
};

export const borrarNegocio = async (negocioId) => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const negocioRef = doc(db, "negocios", negocioId);
    const negocioSnap = await getDoc(negocioRef);
    if (!negocioSnap.exists()) throw new Error("El negocio no existe");
    if (negocioSnap.data().creadoPor !== user.uid) {
        throw new Error("No tienes permiso para eliminar este negocio");
    }
    await deleteDoc(negocioRef);
    return { success: true };
};

// ============================================
// Giro seguro — el ganador lo decide el BACKEND
// ============================================

/**
 * realizarGiroSeguro
 * Llama a la Cloud Function "girarRuleta" en Firebase Functions.
 * El servidor verifica autenticación, tiros disponibles, elige el
 * ganador aleatoriamente y escribe la transacción de forma atómica.
 * El frontend NO puede manipular el resultado.
 */
export const realizarGiroSeguro = async (negocioId) => {
    const functions = getFunctions(undefined, "us-central1");
    const girarRuleta = httpsCallable(functions, "girarRuleta");
    const result = await girarRuleta({ negocioId });
    // result.data contiene: { indicePremio, nombrePremio, tipoPremio, giroId }
    return result.data;
};

// ============================================
// Historial
// ============================================

export const getHistorialUsuario = async () => {
    const user = auth.currentUser;
    if (!user) throw new Error("Usuario no autenticado");
    const q = query(
        collection(db, "giros"),
        where("usuarioId", "==", user.uid),
    );
    const querySnapshot = await getDocs(q);
    const giros = [];
    for (const docSnap of querySnapshot.docs) {
        const giro = { id: docSnap.id, ...docSnap.data() };
        const negocioRef = doc(db, "negocios", giro.negocioId);
        const negocioSnap = await getDoc(negocioRef);
        giro.negocioNombre = negocioSnap.exists()
            ? negocioSnap.data().nombre
            : "Negocio eliminado";
        giros.push(giro);
    }
    giros.sort(
        (a, b) => (b.fechaGiro?.seconds || 0) - (a.fechaGiro?.seconds || 0),
    );
    return giros;
};
