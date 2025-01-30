// src/app/lib/inicializar.ts
import Rol from '../models/catalogos/Rol';
import Usuario from '../models/Usuario';
import Cliente from '../models/catalogos/Cliente';
import bcrypt from 'bcrypt';
import connectMongo from './mongodb';

const inicializar = async () => {
  // Establecer la conexión a la base de datos
  await connectMongo();

  // Inicializar roles
  const roles = ['Super', 'Administrador', 'Usuario'];
  for (const nombre of roles) {
    const existingRole = await Rol.findOne({ nombre });
    if (!existingRole) {
      await Rol.create({ nombre });
    }
  }

  // Crear cliente "Dev" si no existe
  const devCliente = await Cliente.findOne({ nombre: 'Dev' });
  let clienteId;
  if (!devCliente) {
    const newCliente = await Cliente.create({ nombre: 'Dev', activo: true });
    clienteId = newCliente._id;
  } else {
    clienteId = devCliente._id;
  }

  // Obtener el rol "Super" para asignarlo al usuario
  const superRole = await Rol.findOne({ nombre: 'Super' });
  const existingUser = await Usuario.findOne({ email: 'super@admin.com' });
    if (!existingUser) {
      // Crear el super usuario con la contraseña hasheada
      const hashedPassword = await bcrypt.hash('Super1234*', 10); // Cambiar 'Super1234*' por la contraseña que desees
      await Usuario.create({
        email: 'admin@super.com',
        password: hashedPassword,
        rol: superRole._id, // Asigna el rol "Super" al usuario
        cliente: clienteId, // Asigna el cliente "Dev" al usuario
        verificado: true,
      });
    } 
    console.log('Inicialización correcta');

};

export default inicializar;
