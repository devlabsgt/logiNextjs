import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import connectMongo from '@/app/lib/mongodb';
import Usuario from '@/app/models/Usuario';

const JWT_SECRET = process.env.JWT_SECRET!; // Asegúrate de que esta variable esté configurada correctamente

export async function POST(request: Request) {
  await connectMongo();

  try {
    const { email, password } = await request.json();

    // Validar datos de entrada
    if (!email || !password) {
      return NextResponse.json({ message: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    const usuario = await Usuario.findOne({ email }).populate('rol', 'nombre');
    if (!usuario) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(password, usuario.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Generar el token JWT
    const token = jwt.sign(
      {
        id: usuario._id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: usuario.rol.nombre,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    return NextResponse.json({ token, message: 'Inicio de sesión exitoso' });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
