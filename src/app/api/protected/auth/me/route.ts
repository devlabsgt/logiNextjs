import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(request: Request) {
  try {
    // Obtener el token de las cookies
    const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("token="))?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Token no encontrado" }, { status: 401 });
    }

    // Verificar el token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    // Retornar los datos del usuario decodificados
    return NextResponse.json({
      id: payload.id,
      email: payload.email,
      rol: payload.rol,
    });
  } catch (error) {
    console.error("Error al verificar el token:", error);
    return NextResponse.json({ message: "Token inválido" }, { status: 401 });
  }
}
