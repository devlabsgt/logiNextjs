import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectMongo from '@/app/lib/mongodb';
import Usuario from '@/app/models/Usuario';
import Rol from '@/app/models/catalogos/Rol';

export async function GET(request: Request) {
  await connectMongo();

  const url = new URL(request.url);
  const rol = url.searchParams.get('rol');
  const activo = url.searchParams.get('activo');
  const sesion = url.searchParams.get('sesion');

  // Crear el objeto de filtros con un tipo definido
  const filters: { rol?: string; activo?: boolean; sesion?: boolean } = {};
  console.log('se ingreso a la url GET /api/protected/usuarios')
  try {
    // Si se proporciona un rol, buscar el ID del rol en la colección de roles
    if (rol) {
      const rolRecord = await Rol.findOne({ nombre: rol });
      if (!rolRecord) {
        return NextResponse.json({ message: 'Rol no válido' }, { status: 400 });
      }
      filters.rol = rolRecord._id; // Asignar el ID del rol encontrado al filtro
    }

    if (activo !== null) filters.activo = activo === 'true';
    if (sesion !== null) filters.sesion = sesion === 'true';

    // Obtener usuarios con los filtros aplicados
    let usuarios = await Usuario.find(filters).populate('rol'); // Obtener detalles del rol

    // Excluir usuarios con rol "super"
    usuarios = usuarios.filter((usuario) => usuario.rol.nombre !== "Super");

    // Enviar los usuarios sin formatear las fechas
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json({ message: 'Error al obtener usuarios' }, { status: 500 });
  }
}

// POST: Crear un usuario
export async function POST(request: Request) {
  try {
    await connectMongo();
    const { email, password, rol } = await request.json();

    console.log("Datos recibidos del frontend:", { email, password, rol });

    // Verificar si el usuario ya existe
    const existingUser = await Usuario.findOne({ email });
    if (existingUser) {
      console.log("Usuario ya existe con el email:", email);
      return NextResponse.json({ message: 'Usuario ya existe' }, { status: 400 });
    }

    // Buscar el rol en la colección de roles y normalizar el nombre
    const rolRecord = await Rol.findOne({ nombre: rol.trim() });
    console.log("Resultado de la búsqueda de rol:", rolRecord);

    if (!rolRecord) {
      console.log("Error: El rol proporcionado no es válido o no se encuentra en la base de datos.");
      return NextResponse.json({ message: 'Rol no válido' }, { status: 400 });
    }

    // Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario con el ID del rol
    const newUser = new Usuario({
      email,
      password: hashedPassword,
      rol: rolRecord._id, // Asignar el ID del rol encontrado
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
