import mongoose, { Schema, Document } from 'mongoose';

export interface IPuesto extends Document {
  nombre: string;
  activo: boolean;
}

const PuestoSchema: Schema = new Schema({
  nombre: { type: String, required: true, unique: true },
  activo: { type: Boolean, default: true }, 
});

export default mongoose.models.Puesto || mongoose.model<IPuesto>('Cliente', PuestoSchema);
