import { NextResponse } from 'next/server';
import connectMongo from '@/app/lib/mongodb';
import Role from '@/app/models/Role';

export async function GET(request: Request) {
  try {
    await connectMongo();

    // Obtener el parámetro "activo" de la URL
    const url = new URL(request.url);
    const activo = url.searchParams.get('activo');

    // Preparar los filtros de búsqueda
    const filters: { activo?: boolean; nombre?: { $ne: string } } = {
      nombre: { $ne: 'Hola' }, // Excluir roles con nombre 'Super'
    };
    if (activo !== null) filters.activo = activo === 'true';

    const roles = await Role.find(filters);
    return NextResponse.json(roles);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    return NextResponse.json({ message: 'Error al obtener roles' }, { status: 500 });
  }
}

// POST: Crear un nuevo rol
export async function POST(request: Request) {
  console.log('Recibiendo POST en /api/roles');
  try {
    await connectMongo();
    const body = await request.json();
    console.log('Cuerpo de la solicitud:', body);

    const { nombre } = body;

    // Verificar si el rol ya existe
    const existingRole = await Role.findOne({ nombre });
    if (existingRole) {
      console.log('Rol ya existe:', existingRole);
      return NextResponse.json({ message: 'El rol ya existe' }, { status: 400 });
    }

    const newRole = new Role({ nombre });
    await newRole.save();
    console.log('Rol creado:', newRole);

    return NextResponse.json({ message: 'Rol creado exitosamente', role: newRole });
  } catch (error) {
    console.error('Error al crear rol:', error);
    return NextResponse.json({ message: 'Error al crear rol' }, { status: 500 });
  }
}

