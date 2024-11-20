import { NextResponse } from 'next/server';
import connectMongo from '@/app/lib/mongodb';
import Empleado from '@/app/models/Empleado';
import Usuario from '@/app/models/Usuario';


export async function GET(request: Request) {
  try {
    await connectMongo();
    // Obtener los parámetros de búsqueda de la URL
    const url = new URL(request.url);
    const usuarioId = url.searchParams.get('usuario');
    const cargo = url.searchParams.get('cargo');
    // Filtros para la consulta
    const filters: { usuario?: string; cargo?: string } = {};
    if (usuarioId) filters.usuario = usuarioId;
    if (cargo) filters.cargo = cargo;

    const empleados = await Empleado.find(filters).populate('usuario'); // Popula la referencia al usuario
    return NextResponse.json(empleados);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    return NextResponse.json({ message: 'Error al obtener empleados' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectMongo();

    const {
      usuario,
      direccion,
      dpi,
      igss,
      nit,
      cargo,
      banco,
      cuenta,
      sueldo,
      bonificacion,
      fechaInicio,
      fechaFinalizacion,
      contratoNo,
      renglon,
      activo,
    } = await request.json();
    // Validar si el usuario existe (si el usuario es proporcionado)
    if (usuario) {
      const existingUser = await Usuario.findById(usuario);
      if (!existingUser) {
        return NextResponse.json(
          { message: 'El usuario asociado no existe' },
          { status: 400 }
        );
      }
    }

    // Verificar si el DPI, IGSS, NIT o Cuenta ya existen
    const existingEmpleado = await Empleado.findOne({
      $or: [{ dpi }, { igss }, { nit }, { cuenta }],
    });
    if (existingEmpleado) {
      return NextResponse.json(
        { message: 'DPI, IGSS, NIT o Cuenta ya están registrados' },
        { status: 400 }
      );
    }

    // Crear el nuevo empleado
    const newEmpleado = new Empleado({
      usuario,
      direccion,
      dpi,
      igss,
      nit,
      cargo,
      banco,
      cuenta,
      sueldo,
      bonificacion,
      fechaInicio,
      fechaFinalizacion,
      contratoNo,
      renglon,
      activo,
    });
    await newEmpleado.save();

    return NextResponse.json({
      message: 'Empleado creado exitosamente',
      empleado: newEmpleado,
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    return NextResponse.json({ message: 'Error al crear empleado' }, { status: 500 });
  }
}
