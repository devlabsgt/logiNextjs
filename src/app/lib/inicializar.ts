// src/app/lib/inicializar.ts
import Rol from "../models/catalogos/Rol";
import Usuario from "../models/Usuario";
import Cliente from "../models/catalogos/Cliente";
import bcrypt from "bcrypt";
import connectMongo from "./mongodb";

const inicializar = async () => {
  try {
    console.log("⏳ Estableciendo conexión a MongoDB...");
    await connectMongo();
    console.log("✅ Conexión establecida correctamente.");

    // Inicializar roles
    const roles = ["Super", "Administrador", "Usuario"];
    for (const nombre of roles) {
      const existingRole = await Rol.findOne({ nombre });
      if (!existingRole) {
        await Rol.create({ nombre });
        console.log(`✅ Rol "${nombre}" creado.`);
      }
    }

    // Crear cliente "Dev" si no existe
    let clienteId;
    const devCliente = await Cliente.findOne({ nombre: "Dev" });
    if (!devCliente) {
      const newCliente = await Cliente.create({ nombre: "Dev", activo: true });
      clienteId = newCliente._id;
      console.log("✅ Cliente 'Dev' creado.");
    } else {
      clienteId = devCliente._id;
    }

    // Crear usuario "Super" si no existe
    const superRole = await Rol.findOne({ nombre: "Super" });
    if (!superRole) {
      throw new Error("El rol 'Super' no existe. Asegúrate de que los roles se crean correctamente.");
    }

    const existingUser = await Usuario.findOne({ email: "super@admin.com" });
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash("Super1234*", 10);
      await Usuario.create({
        email: "admin@super.com",
        password: hashedPassword,
        rol: superRole._id,
        cliente: clienteId,
        verificado: true,
      });
      console.log("✅ Usuario 'Super' creado.");
    }

    console.log("✅ Inicialización completada.");
  } catch (error) {
    console.error("❌ Error durante la inicialización:", error);
  }
};

export default inicializar;
