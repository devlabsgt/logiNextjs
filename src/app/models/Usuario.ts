// src/app/models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IRole } from './Role';

export interface IUser extends Document {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  fechaNacimiento: Date;
  rol: IRole['_id']; // Referencia al ID de un documento de Role
  sesion: boolean;
  activo: boolean;
  verificado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema(
  {
    nombre: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    telefono: { type: String, required: true },
    fechaNacimiento: { type: Date, required: true },
    rol: { type: Schema.Types.ObjectId, ref: 'Role', required: true },
    sesion: { type: Boolean, default: false },
    activo: { type: Boolean, default: true },
    verificado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Usuario || mongoose.model<IUser>('Usuario', UserSchema);
