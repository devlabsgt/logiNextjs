import mongoose, { Schema, Document } from "mongoose";

export interface ICliente extends Document {
  nombre: string; // Nombre del gimnasio
  activo: boolean; // Estado del cliente (activo o inactivo)
  createdAt?: Date; // Fecha de creación (automática)
  updatedAt?: Date; // Fecha de última actualización (automática)
}

const IClienteSchema: Schema = new Schema(
  {
    nombre: { type: String, required: true, unique: true }, // Nombre único para identificar al gimnasio
    activo: { type: Boolean, default: true }, // Estado del gimnasio
  },
  {
    timestamps: true, // Agrega automáticamente `createdAt` y `updatedAt`
  }
);

export default mongoose.models.ICliente || mongoose.model<ICliente>("Cliente", IClienteSchema);
