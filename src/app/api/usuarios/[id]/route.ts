import { NextResponse } from 'next/server';
import connectMongo from '@/app/lib/mongodb';
import Usuario from '@/app/models/Usuario';
import bcrypt from 'bcrypt';
import moment from 'moment-timezone';
import { Types } from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Esperar a que se resuelva la promesa para obtener 'id'
  try {
    await connectMongo();
    const usuario = await Usuario.findById(id).populate('rol'); // Populate para obtener detalles del rol

    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    // Convertir las fechas a la hora de Guatemala (UTC -6) y formatearlas
    const usuarioConFechaLocal = {
      ...usuario.toObject(),
      createdAt: moment(usuario.createdAt)
        .tz('America/Guatemala')
        .format('DD-MM-YYYY HH:mm:ss'),
      updatedAt: moment(usuario.updatedAt)
        .tz('America/Guatemala')
        .format('DD-MM-YYYY HH:mm:ss'),
    };

    return NextResponse.json(usuarioConFechaLocal);
  } catch (error) {
    console.error('Error al obtener el usuario:', error);
    return NextResponse.json(
      { message: 'Error al obtener el usuario' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectMongo();
    const updates = await request.json();
    const allowedUpdates = ['email', 'password', 'rol', 'sesion', 'activo', 'verificado'];
    const fieldsToUpdate: Record<string, unknown> = {};

    for (const key of allowedUpdates) {
      if (key in updates) {
        if (key === 'password') {
          fieldsToUpdate[key] = await bcrypt.hash(updates[key], 10);
        } else if (key === 'rol') {
          // Verificar si el rol tiene un formato de ObjectId válido
          console.log("Valor de rol antes de convertir:", updates[key]);

          if (Types.ObjectId.isValid(updates[key])) {
            fieldsToUpdate[key] = new Types.ObjectId(updates[key]);
          } else {
            console.error("El valor de rol no es un ObjectId válido:", updates[key]);
            return NextResponse.json(
              { message: "El valor de rol no es un ObjectId válido" },
              { status: 400 }
            );
          }
        } else {
          fieldsToUpdate[key] = updates[key];
        }
      }
    }

    const updatedUser = await Usuario.findByIdAndUpdate(id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });
    if (!updatedUser) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Usuario actualizado exitosamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { message: 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Esperar a que se resuelva la promesa para obtener 'id'
  try {
    await connectMongo();

    const updatedUser = await Usuario.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Usuario inactivado exitosamente',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error al inactivar usuario:', error);
    return NextResponse.json(
      { message: 'Error al inactivar usuario' },
      { status: 500 }
    );
  }
}