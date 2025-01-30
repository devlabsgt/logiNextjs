import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from './Usuario';
import { IPuesto } from './catalogos/Puesto';

export interface IEmpleado extends Document {
  usuario?: IUser['_id']; // Relación opcional con Usuario
  nombre: string;
  telefono: string;
  fechaNacimiento: Date;
  direccion: string; // Dirección residencial
  dpi: string;
  igss: string;
  nit: string;
  puesto: IPuesto['_id']; // Relación con Puesto
  banco: string;
  cuenta: string;
  bonificacion: number;
  fechaInicio: Date;
  fechaFinalizacion: Date;
  contratoNo: string;
  renglon: string;
  activo: boolean;
}

const EmpleadoSchema: Schema = new Schema({
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: false },
  nombre: { type: String, required: true },
  telefono: { type: String, required: true },
  fechaNacimiento: { type: Date, required: true },
  direccion: { type: String, required: true },
  dpi: { type: String, required: true, unique: true },
  igss: { type: String, required: true, unique: true },
  nit: { type: String, required: true, unique: true },
  puesto: { type: Schema.Types.ObjectId, ref: 'Puesto', required: true, unique: true  },
  banco: { type: Schema.Types.ObjectId, ref: 'Banco', required: true },
  cuenta: { type: String, required: true, unique: true },
  bonificacion: { type: Number, required: true },
  fechaInicio: { type: Date, required: true },
  fechaFinalizacion: { type: Date, required: true },
  contratoNo: { type: String, required: true, unique: true },
  renglon: { type: Schema.Types.ObjectId, ref: 'Renglon', required: true },
  activo: { type: Boolean, default: true },
});

export default mongoose.models.Empleado || mongoose.model<IEmpleado>('Empleado', EmpleadoSchema);