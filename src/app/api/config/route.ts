// src/app/api/config/route.ts
import { NextResponse } from 'next/server';
import { connectMongo } from '@/app//lib/mongodb';
import inicializar from "@/app/lib/inicializar";

export async function POST() {
  try {
    await connectMongo();
    await inicializar(); // Inicializa los roles por defecto
    return NextResponse.json({ message: 'Configuración inicializada correctamente' });
  } catch (error) {
    console.error('Error al inicializar configuración: ' + error);
    return NextResponse.json({ message: 'Error al inicializar configuración' }, { status: 500 });
  }
}
