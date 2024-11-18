import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectMongo from '@/app/lib/mongodb';
import Usuario from '@/app/models/Usuario';
import Role from '@/app/models/Role'; // Importa el modelo de Role
import moment from 'moment-timezone'; // Importa moment con la zona horaria

export async function GET(request: Request) {
  await connectMongo();

  const url = new URL(request.url);
  const rol = url.searchParams.get('rol');
  const activo = url.searchParams.get('activo');
  const sesion = url.searchParams.get('sesion');

  // Crear el objeto de filtros con un tipo definido
  const filters: { rol?: string; activo?: boolean; sesion?: boolean } = {};

  try {
    // Si se proporciona un rol, buscar el ID del rol en la colección de roles
    if (rol) {
      const roleRecord = await Role.findOne({ nombre: rol });
      if (!roleRecord) {
        return NextResponse.json({ message: 'Rol no válido' }, { status: 400 });
      }
      filters.rol = roleRecord._id; // Asignar el ID del rol encontrado al filtro
    }

    if (activo !== null) filters.activo = activo === 'true';
    if (sesion !== null) filters.sesion = sesion === 'true';

    // Obtener usuarios con los filtros aplicados
    let usuarios = await Usuario.find(filters).populate('rol'); // Obtener detalles del rol

    // Excluir usuarios con rol "super"
    usuarios = usuarios.filter((usuario) => usuario.rol.nombre !== "Super");

    // Convertir las fechas de los usuarios a la zona horaria de Guatemala
    const usuariosConFechaLocal = usuarios.map((usuario) => ({
      ...usuario.toObject(),
      createdAt: moment(usuario.createdAt).tz('America/Guatemala').format('DD-MM-YYYY HH:mm:ss'),
      updatedAt: moment(usuario.updatedAt).tz('America/Guatemala').format('DD-MM-YYYY HH:mm:ss'),
    }));

    return NextResponse.json(usuariosConFechaLocal);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ message: 'Error al obtener usuarios' }, { status: 500 });
  }
}
// POST: Crear un usuario
export async function POST(request: Request) {
  try {
    await connectMongo();
    const { nombre, email, password, telefono, fechaNacimiento, rol } = await request.json();

    console.log("Datos recibidos del frontend:", { nombre, email, password, telefono, fechaNacimiento, rol });

    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      console.log("Usuario ya existe con el email:", email);
      return NextResponse.json({ message: 'Usuario ya existe' }, { status: 400 });
    }

    // Buscar el rol en la colección de roles y normalizar el nombre
    const roleRecord = await Role.findOne({ nombre: rol.trim() });
    console.log("Resultado de la búsqueda de rol:", roleRecord);

    if (!roleRecord) {
      console.log("Error: El rol proporcionado no es válido o no se encuentra en la base de datos.");
      return NextResponse.json({ message: 'Rol no válido' }, { status: 400 });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario con el ID del rol
    const newUser = new Usuario({
      nombre,
      email,
      password: hashedPassword,
      telefono,
      fechaNacimiento,
      rol: roleRecord._id, // Asignar el ID del rol encontrado
      sesion: false,
      activo: true,
      verificado: false,
    });

    await newUser.save();
    console.log("Usuario registrado exitosamente:", newUser);

    return NextResponse.json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json({ message: 'Error al registrar usuario' }, { status: 500 });
  }
}