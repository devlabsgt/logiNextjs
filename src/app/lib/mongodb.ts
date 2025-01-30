import mongoose from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL!;

if (!MONGODB_URL) {
  throw new Error('Por favor define la variable de entorno MONGODB_URL en el archivo .env');
}

// Controlar el estado de conexión globalmente
let isConnected = false; // Estado de la conexión

export async function connectMongo() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URL, {
      bufferCommands: false,
    });
    isConnected = db.connections[0].readyState === 1; // Verifica si la conexión está lista
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    throw new Error('No se pudo conectar a MongoDB');
  }
}

export default connectMongo;
