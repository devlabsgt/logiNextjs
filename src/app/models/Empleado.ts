import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './Usuario';

export interface IEmpleado extends Document {
  usuario?: IUser['_id']; // Hacemos que sea opcional usando "?"
  direccion: string;
  dpi: string;
  igss: string;
  nit: string;
  cargo: string;
  banco: string;
  cuenta: string;
  sueldo: number;
  bonificacion: number;
  fechaInicio: Date;
  fechaFinalizacion: Date;
  contratoNo: string;
  renglon: string;
  activo: boolean; // Nuevo campo
}

const EmpleadoSchema: Schema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: false }, 
  direccion: { type: String, required: true },
  dpi: { type: String, required: true, unique: true },
  igss: { type: String, required: true, unique: true },
  nit: { type: String, required: true, unique: true },
  cargo: { type: String, required: true },
  banco: { type: String, required: true },
  cuenta: { type: String, required: true, unique: true },
  sueldo: { type: Number, required: true },
  bonificacion: { type: Number, required: true },
  fechaInicio: { type: Date, required: true },
  fechaFinalizacion: { type: Date, required: true },
  contratoNo: { type: String, required: true, unique: true },
  renglon: { type: String, required: true },
  activo: { type: Boolean, default: true }, 
});

export default mongoose.models.Empleado || mongoose.model<IEmpleado>('Empleado', EmpleadoSchema);