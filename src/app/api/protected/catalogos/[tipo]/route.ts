import { NextRequest, NextResponse } from 'next/server';
import Banco from '../../../../models/catalogos/Banco';
import Renglon from '../../../../models/catalogos/Renglon';
import Rol from '../../../../models/catalogos/Rol';
import connectMongo from '@/app/lib/mongodb';

const getModelByType = (tipo: string) => {
  switch (tipo) {
    case 'banco':
      return Banco;
    case 'renglon':
      return Renglon;
    case 'rol':
      return Rol;
    default:
      throw new Error('Tipo de catálogo no válido');
  }
};

// Obtener todos los registros (GET)
export async function GET(req: NextRequest, context: { params: Promise<{ tipo: string }> }) {
  await connectMongo();

  const { tipo } = await context.params; // Resolviendo la promesa de `params`
  const model = getModelByType(tipo);

  try {
    const registros = await model.find();
    return NextResponse.json(registros, { status: 200 }); // Devuelve directamente el arreglo
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
  }
}

// Crear un registro (POST)
export async function POST(req: NextRequest, context: { params: Promise<{ tipo: string }> }) {
  await connectMongo();

  const { tipo } = await context.params; // Resolviendo la promesa de `params`
  const model = getModelByType(tipo);

  const body = await req.json();
  const { nombre } = body;

  if (!nombre) {
    return NextResponse.json({ error: 'El campo "nombre" es obligatorio.' }, { status: 400 });
  }

  try {
    const nuevoRegistro = await model.create({ nombre });
    return NextResponse.json(nuevoRegistro, { status: 201 }); // Devuelve directamente el nuevo registro
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
  }
}

// Actualizar un registro (PUT)
export async function PUT(req: NextRequest, context: { params: Promise<{ tipo: string }> }) {
  await connectMongo();

  const { tipo } = await context.params; // Resolviendo la promesa de `params`
  const model = getModelByType(tipo);

  const body = await req.json();
  const { id, nombre, activo } = body;

  if (!id) {
    return NextResponse.json({ error: 'El campo "id" es obligatorio.' }, { status: 400 });
  }

  const updateFields: { nombre?: string; activo?: boolean } = {};
  if (nombre) updateFields.nombre = nombre;
  if (typeof activo !== 'undefined') updateFields.activo = activo;

  try {
    const actualizado = await model.findByIdAndUpdate(id, updateFields, { new: true });
    if (!actualizado) {
      return NextResponse.json({ error: 'Registro no encontrado.' }, { status: 404 });
    }

    return NextResponse.json(actualizado, { status: 200 }); // Devuelve directamente el registro actualizado
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Error desconocido' }, { status: 500 });
  }
}
