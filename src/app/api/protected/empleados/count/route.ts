import { NextResponse } from 'next/server';
import connectMongo from '@/app/lib/mongodb';
import Empleado from '@/app/models/Empleado';

export async function GET() {
  await connectMongo();

  try {
    // Obtener todos los empleados
    const empleados = await Empleado.find();

    // Realizar conteos en base a su estado de actividad
    const activos = empleados.filter((empleado) => empleado.activo).length;
    const inactivos = empleados.filter((empleado) => !empleado.activo).length;

    // Devolver solo los conteos de activos e inactivos
    return NextResponse.json({
      activos,
      inactivos,
    });
  } catch (error) {
    console.error('Error al contar empleados:', error);
    return NextResponse.json(
      { message: 'Error al contar empleados' },
      { status: 500 }
    );
  }
}
