import { NextResponse } from "next/server";
import connectMongo from "@/app/lib/mongodb";
import Usuario from "@/app/models/Usuario";

export async function GET() {
  try {
    // Asegurar conexión a MongoDB
    await connectMongo();

    // Tiempo límite para considerar una sesión activa (1 hora, por ejemplo)
    const limiteTiempo = 60 * 60 * 1000; // 1 hora en milisegundos
    const ahora = new Date();

    // Excluir usuarios con rol "Super"
    const usuariosExcluyendoSuper = await Usuario.find()
      .populate({
        path: "rol", // Campo que referencia al modelo Rol
        match: { nombre: { $ne: "Super" } }, // Excluye roles donde nombre sea "Super"
      })
      .exec();

    // Filtrar usuarios que aún tengan roles poblados (porque los que no cumplen match tendrán null en `rol`)
    const filtrados = usuariosExcluyendoSuper.filter((usuario) => usuario.rol !== null);

    // Realizar conteos en base al filtrado
    const total = filtrados.length;
    const activos = filtrados.filter((usuario) => usuario.activo).length;
    const inactivos = filtrados.filter((usuario) => !usuario.activo).length;

    // Verificar sesiones activas basadas en el campo `sesion` como Date
    const sesion = filtrados.filter(
      (usuario) => usuario.sesion && new Date(usuario.sesion).getTime() >= ahora.getTime() - limiteTiempo
    ).length;

    // Devolver los conteos en un objeto
    return NextResponse.json({
      total,
      activos,
      inactivos,
      sesion,
    });
  } catch (error) {
    console.error("Error al contar usuarios:", error);
    return NextResponse.json(
      { message: "Error al contar usuarios" },
      { status: 500 }
    );
  }
}
