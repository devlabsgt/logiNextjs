import mongoose from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL!;

if (!MONGODB_URL) {
  throw new Error(
    "Por favor define la variable de entorno MONGODB_URL en el archivo .env"
  );
}

// Controlar el estado de conexión globalmente
export async function connectMongo() {
  if (mongoose.connection.readyState >= 1) {
    console.log("✅ MongoDB ya está conectado.");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URL, {
      bufferCommands: true, // ✅ Deja el buffer activo para evitar el error.
    });

    console.log("✅ Conectado a MongoDB");
  } catch (error) {
    console.error("❌ Error al conectar a MongoDB:", error);
    throw new Error("No se pudo conectar a MongoDB");
  }
}

export default connectMongo;
