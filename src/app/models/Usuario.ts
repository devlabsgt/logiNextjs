import mongoose, { Schema, Document } from "mongoose";
import { IRol } from "./catalogos/Rol"; // Importa solo la interfaz si es necesario
import { ICliente } from "./catalogos/Cliente"; // Importa solo la interfaz si es necesario

export interface IUser extends Document {
  email: string;
  password: string;
  rol: IRol["_id"]; // Referencia al ID del modelo Rol
 // cliente: ICliente["_id"]
  sesion: Date | null; // Ahora representa la última vez que el usuario inició sesión
  activo: boolean;
  verificado: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema = new Schema(
  {
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    rol: { type: Schema.Types.ObjectId, ref: "Rol", required: true }, 
   // cliente: { type: Schema.Types.ObjectId, ref: "Cliente", required: false }, 
    sesion: { type: Date, default: null },
    activo: { type: Boolean, default: false },
    verificado: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const UserModel = mongoose.models.Usuario || mongoose.model<IUser>("Usuario", UserSchema);
export default UserModel;
