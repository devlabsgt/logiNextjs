// src/app/lib/initializeRoles.ts
import Role from '@/app/models/Role';
import Usuario from '@/app/models/Usuario';
import bcrypt from 'bcrypt';

const inicializar = async () => {
  const roles = ['Super', 'Administrador'];

  for (const nombre of roles) {
    const existingRole = await Role.findOne({ nombre });
    if (!existingRole) {
      await Role.create({ nombre });
    }
  }

  // Obtener el rol "Super" para asignarlo al usuario
  const superRole = await Role.findOne({ nombre: 'Super' });

  if (superRole) {
    // Verificar si el super usuario ya existe
    const existingUser = await Usuario.findOne({ email: 'admin@super.com' });
    if (!existingUser) {
      // Crear el super usuario con la contraseña hasheada
      const hashedPassword = await bcrypt.hash('Super1234*', 10); // Cambia 'superpassword' por la contraseña que desees

      await Usuario.create({
        nombre: 'Super Usuario',
        email: 'admin@super.com',
        password: hashedPassword,
        telefono: '1234567890',
        fechaNacimiento: new Date('1990-01-01'),
        rol: superRole._id, // Asigna el rol "Super" al usuario
        verificado: true,
      });
    }
  } else {
    console.error('No se encontró el rol "Super", no se pudo crear el usuario Super');
  }
};

export default inicializar;
