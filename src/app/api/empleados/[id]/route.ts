import { NextResponse } from 'next/server';
import connectMongo from '@/app/lib/mongodb';
import Empleado from '@/app/models/Empleado';

// GET: Obtener un empleado por ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: 'ID del empleado es obligatorio' },
        { status: 400 }
      );
    }

    const empleado = await Empleado.findById(id).populate('usuario');
    if (!empleado) {
      return NextResponse.json(
        { message: 'Empleado no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(empleado);
  } catch (error) {
    console.error('Error en GET empleado:', error);
    return NextResponse.json(
      { message: 'Error al obtener empleado' },
      { status: 500 }
    );
  }
}
// PUT: Actualizar un empleado por ID
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: 'ID del empleado es obligatorio' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const empleadoActualizado = await Empleado.findByIdAndUpdate(
      id,
      body,
      { new: true }
    ).populate('usuario');

    if (!empleadoActualizado) {
      return NextResponse.json(
        { message: 'Empleado no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(empleadoActualizado);
  } catch (error) {
    console.error('Error en PUT empleado:', error);
    return NextResponse.json(
      { message: 'Error al actualizar empleado' },
      { status: 500 }
    );
  }
}
// DELETE: Eliminar un empleado por ID
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectMongo();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: 'ID del empleado es obligatorio' },
        { status: 400 }
      );
    }

    const empleadoEliminado = await Empleado.findByIdAndDelete(id);
    if (!empleadoEliminado) {
      return NextResponse.json(
        { message: 'Empleado no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Empleado eliminado correctamente',
    });
  } catch (error) {
    console.error('Error en DELETE empleado:', error);
    return NextResponse.json(
      { message: 'Error al eliminar empleado' },
      { status: 500 }
    );
  }
}