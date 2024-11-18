// src/lib/mongodb.ts
import mongoose from 'mongoose';
import inicializarRoles from './inicializar';
const MONGODB_URL = process.env.MONGODB_URL!;

if (!MONGODB_URL) {
  throw new Error('Por favor define la variable de entorno MONGODB_URL en el archivo .env');
}

export async function connectMongo() {
  try {
    if (mongoose.connection.readyState >= 1) {
      // Llamada a inicializarRoles solo si no se ha inicializado
      await inicializarRoles(); 
      return mongoose.connection;
    }

    // Establece una nueva conexión y luego inicializa los roles
    await mongoose.connect(MONGODB_URL, {
      bufferCommands: false,
    });

    // Llamada a inicializarRoles después de la conexión
    await inicializarRoles();
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
  }
}

export default connectMongo;
