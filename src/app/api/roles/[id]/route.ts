import { NextResponse } from 'next/server';
import connectMongo from '@/app/lib/mongodb';
import Role from '@/app/models/Role';
import Usuario from '@/app/models/Usuario';

// GET: Obtener un rol por ID
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> } // Cambiado a Promise
) {
  const { id } = await context.params; // Esperar a que se resuelva el Promise
  try {
    await connectMongo();

    // Buscar el rol por ID
    const role = await Role.findById(id);

    // Si el rol no se encuentra, responder con un error 404
    if (!role) {
      return NextResponse.json({ message: 'Rol no encontrado' }, { status: 404 });
    }

    // Retornar el rol encontrado
    return NextResponse.json(role);
  } catch (error) {
    console.error('Error al obtener el rol:', error);
    return NextResponse.json({ message: 'Error al obtener el rol' }, { status: 500 });
  }
}

// PUT: Actualizar un rol por ID
export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await connectMongo();
    const { nombre } = await request.json();

    const updatedRole = await Role.findByIdAndUpdate(
      id,
      { nombre },
      { new: true, runValidators: true }
    );
    if (!updatedRole) {
      return NextResponse.json({ message: 'Rol no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Rol actualizado exitosamente', role: updatedRole });
  } catch (error) {
    console.error('Error al actualizar rol:', error);
    return NextResponse.json({ message: 'Error al actualizar rol' }, { status: 500 });
  }
}

// DELETE: Inactivar o eliminar un rol por ID
export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    await connectMongo();

    // Verifica si el rol tiene usuarios asignados
    const roleToDelete = await Role.findById(id);
    if (!roleToDelete) {
      return NextResponse.json({ message: 'Rol no encontrado' }, { status: 404 });
    }

    const usersWithRole = await Usuario.find({ rol: roleToDelete.nombre });

    if (usersWithRole.length > 0) {
      // Si hay usuarios con el rol, solo inactívalo
      roleToDelete.activo = false;
      await roleToDelete.save();
      return NextResponse.json({
        message: 'Rol inactivado porque está asignado a usuarios existentes',
        role: roleToDelete,
      });
    } else {
      // Si no hay usuarios con el rol, elimínalo
      await Role.findByIdAndDelete(id);
      return NextResponse.json({ message: 'Rol eliminado exitosamente' });
    }
  } catch (error) {
    console.error('Error al eliminar o inactivar rol:', error);
    return NextResponse.json({ message: 'Error al eliminar o inactivar rol' }, { status: 500 });
  }
}
