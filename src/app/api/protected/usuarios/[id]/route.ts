import { NextResponse } from "next/server";
import connectMongo from "@/app/lib/mongodb";
import Usuario from "@/app/models/Usuario";
import bcrypt from "bcrypt";
import { Types } from "mongoose";
import Rol from "@/app/models/catalogos/Rol";

//TEN CUIDADO DE AQUI EN ADELANTE ES NECESARIO AGREGARLE EL AWAIT A PARAMS


export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ⬅ Asegúrate de usar `await`
  try {
    await connectMongo();
    const usuario = await Usuario.findById(id).populate("rol");

    if (!usuario) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(usuario);
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return NextResponse.json(
      { message: "Error al obtener el usuario" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ⬅ Asegúrate de usar `await`
  try {
    await connectMongo();

    const updatedUser = await Usuario.findByIdAndUpdate(
      id,
      { activo: false },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Usuario inactivado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al inactivar usuario:", error);
    return NextResponse.json(
      { message: "Error al inactivar usuario" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> } // ⬅ `params` ahora es una promesa en Next.js 15
) {
  const { id } = await context.params; // ⬅ Ahora `params` se debe esperar

  if (!id || !Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: "El ID proporcionado no es válido." },
      { status: 400 }
    );
  }

  try {
    await connectMongo();

    const updates = await request.json();
    const existingUser = await Usuario.findById(id);

    if (!existingUser) {
      return NextResponse.json(
        { message: "Usuario no encontrado." },
        { status: 404 }
      );
    }

    const fieldsToUpdate: Record<string, unknown> = {};
    const allowedUpdates = ["email", "password", "rol", "sesion", "activo", "verificado"];

    for (const key of allowedUpdates) {
      if (key in updates) {
        if (key === "password") {
          fieldsToUpdate[key] = await bcrypt.hash(updates[key], 10);
        } else if (key === "email" && updates[key] !== existingUser.email) {
          const emailExists = await Usuario.findOne({ email: updates[key] });
          if (emailExists) {
            return NextResponse.json(
              { message: "El email proporcionado ya está en uso." },
              { status: 400 }
            );
          }
          fieldsToUpdate[key] = updates[key];
        } else if (key === "rol" && updates[key] !== existingUser.rol) {
          const rol = await Rol.findOne({ nombre: updates[key] });
          if (!rol) {
            return NextResponse.json(
              { message: "El rol proporcionado no existe." },
              { status: 400 }
            );
          }
          fieldsToUpdate[key] = rol._id;
        } else if (updates[key] !== existingUser[key]) {
          fieldsToUpdate[key] = updates[key];
        }
      }
    }

    if (Object.keys(fieldsToUpdate).length === 0) {
      return NextResponse.json(
        { message: "No se realizaron cambios." },
        { status: 200 }
      );
    }

    const updatedUser = await Usuario.findByIdAndUpdate(id, fieldsToUpdate, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      return NextResponse.json(
        { message: "Error al actualizar usuario." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Usuario actualizado exitosamente.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return NextResponse.json(
      { message: "Error interno al actualizar usuario." },
      { status: 500 }
    );
  }
}
