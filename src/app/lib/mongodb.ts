import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL!;

if (!MONGODB_URL) {
  throw new Error("⚠️ Debes definir MONGODB_URL en las variables de entorno.");
}

// Controlar la conexión globalmente con una promesa reutilizable
let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectMongo() {
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ MongoDB ya está conectado.");
    return;
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGODB_URL, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 30000, // ⏳ Aumenta el tiempo de espera de conexión (30s)
      socketTimeoutMS: 60000, // ⏳ Aumenta el tiempo de espera de socket (60s)
    });
  }

  try {
    await connectionPromise;
    console.log("✅ Conectado a MongoDB correctamente.");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    connectionPromise = null; // Restablecer la promesa en caso de error
    throw new Error("No se pudo conectar a MongoDB.");
  }
}

export default connectMongo;
