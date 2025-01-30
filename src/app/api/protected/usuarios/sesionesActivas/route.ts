import { NextResponse } from "next/server";
import connectMongo from "@/app/lib/mongodb";
import Usuario from "@/app/models/Usuario";

export async function GET() {
  await connectMongo();

  try {
    // Definir tiempo límite para considerar una sesión activa (por ejemplo, 1 hora)
    const limiteTiempo = 5 * 60 * 1000; // 5 minutos en milisegundos
    const ahora = new Date();
    // Buscar usuarios cuya última sesión fue dentro del tiempo límite
    const usuariosActivos = await Usuario.find({
      sesion: { $gte: new Date(ahora.getTime() - limiteTiempo) }, // Sesiones dentro del rango
    });
    return NextResponse.json({ usuariosActivos });
  } catch (error) {
    console.error("Error al obtener usuarios activos: ", error);
    return NextResponse.json({ message: "Error al obtener usuarios activos" }, { status: 500 });
  }
}