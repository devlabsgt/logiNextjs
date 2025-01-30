import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import connectMongo from "@/app/lib/mongodb";
import Usuario from "@/app/models/Usuario";

const JWT_SECRET = process.env.JWT_SECRET!;
export async function POST(request: Request) {
  console.log("🔄 Intentando conectar a MongoDB...");
  await connectMongo();
  console.log("✅ Conexión a MongoDB establecida.");

  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // 🔹 Buscar usuario después de que la conexión está lista
    const usuario = await Usuario.findOne({ email }).populate("rol");
    if (!usuario) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // 🚨 Verificar si el usuario está inactivo
    if (!usuario.activo) {
      return NextResponse.json(
        { message: "Usuario inactivo, contacta al administrador del sistema." },
        { status: 403 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // ✅ Sesión actualizada
    usuario.sesion = new Date();
    await usuario.save();

    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        rol: usuario.rol.nombre,
      },
      JWT_SECRET,
      { expiresIn: "8h" }
    );

    return NextResponse.json(
      {
        message: "Inicio de sesión exitoso",
        rol: usuario.rol.nombre,
      },
      {
        headers: {
          "Set-Cookie": `token=${token}; HttpOnly; Secure; Path=/; Max-Age=28800; SameSite=Strict`,
        },
      }
    );
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return NextResponse.json(
      { message: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
