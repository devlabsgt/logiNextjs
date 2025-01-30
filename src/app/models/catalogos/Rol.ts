// src/app/models/Rol.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IRol extends Document {
  nombre: string;
  activo: boolean;
}

const RolSchema: Schema = new Schema({
  nombre: { type: String, required: true, unique: true },
  activo: { type: Boolean, default: true },
});

// Limpia el modelo previo si existe para evitar conflictos
delete mongoose.models.Rol;

// Registra el modelo y muestra un mensaje en consola
const RolModel = mongoose.models.Rol || mongoose.model<IRol>('Rol', RolSchema);
export default RolModel;
