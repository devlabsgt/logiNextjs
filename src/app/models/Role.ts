import mongoose, { Schema, Document } from 'mongoose';

export interface IRole extends Document {
  nombre: string;
  activo: boolean;
}

const RoleSchema: Schema = new Schema({
  nombre: { type: String, required: true, unique: true },
  activo: { type: Boolean, default: true },
});

export default mongoose.models.Role || mongoose.model<IRole>('Role', RoleSchema);
