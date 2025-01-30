import mongoose, { Schema, Document } from 'mongoose';

export interface IBanco extends Document {
  nombre: string;
  activo: boolean;
}

const BancoSchema: Schema = new Schema({
  nombre: { type: String, required: true, unique: true },
  activo: { type: Boolean, default: true }, 
});

export default mongoose.models.Banco || mongoose.model<IBanco>('Banco', BancoSchema);
