import mongoose, { Schema, Document } from 'mongoose';

export interface IRenglon extends Document {
    nombre: string;
    activo: boolean;
}

const RenglonSchema: Schema = new Schema({
    nombre: { type: String, required: true, unique: true },
    activo: { type: Boolean, default: true }, 
});

export default mongoose.models.Renglon || mongoose.model<IRenglon>('Renglon', RenglonSchema);
