import { NextResponse } from 'next/server';
import connectMongo from '@/app/lib/mongodb';
import Empleado from '@/app/models/Empleado';
import Usuario from '@/app/models/Usuario';

  export async function GET(request: Request) {
    try {
      await connectMongo();
      // Obtener los parámetros de búsqueda de la URL
      const url = new URL(request.url);
      const usuarioId = url.searchParams.get('usuario');
      const cargo = url.searchParams.get('cargo');
      // Filtros para la consulta
      const filters: { usuario?: string; cargo?: string } = {};
      if (usuarioId) filters.usuario = usuarioId;
      if (cargo) filters.cargo = cargo;

      const empleados = await Empleado.find(filters).populate('usuario'); // Popula la referencia al usuario
      return NextResponse.json(empleados);
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      return NextResponse.json({ message: 'Error al obtener empleados' }, { status: 500 });
    }
  }

  export async function POST(request: Request) {
    try {
      await connectMongo();
      const {
        usuario,
        nombre,
        telefono,
        fechaNacimiento,
        direccion,
        dpi,
        igss,
        nit,
        cargo,
        banco,
        cuenta,
        sueldo,
        bonificacion,
        fechaInicio,
        fechaFinalizacion,
        contratoNo,
        renglon,
        activo,
      } = await request.json();
      // Validar si el usuario existe (si se proporciona el ID del usuario)
      if (usuario) {
        const existingUser = await Usuario.findById(usuario);
        if (!existingUser) {
          return NextResponse.json(
            { message: 'El usuario asociado no existe' },
            { status: 400 }
          );
        }
      }
      // Verificar si el DPI, IGSS, NIT o Cuenta ya están registrados
      const existingEmpleado = await Empleado.findOne({
        $or: [{ dpi }, { igss }, { nit }, { cuenta }],
      });
      if (existingEmpleado) {
        return NextResponse.json(
          { message: 'DPI, IGSS, NIT o Cuenta ya están registrados' },
          { status: 400 }
        );
      }
      // Crear el nuevo empleado
      const newEmpleado = new Empleado({
        usuario: usuario || undefined, // Asignar `undefined` si no se proporciona `usuario`
        nombre,
        telefono,
        fechaNacimiento,
        direccion,
        dpi,
        igss,
        nit,
        cargo,
        banco,
        cuenta,
        sueldo,
        bonificacion,
        fechaInicio,
        fechaFinalizacion,
        contratoNo,
        renglon,
        activo: activo ?? true, // Asegurar valor por defecto si no se proporciona
      });
      await newEmpleado.save();
      return NextResponse.json({
        message: 'Empleado creado exitosamente',
        empleado: newEmpleado,
      });
    } catch (error) {
      console.error('Error al crear empleado:', error);
      return NextResponse.json(
        { message: 'Error al crear empleado' },
        { status: 500 }
      );
    }
  }

  export async function DELETE() {
    try {
      // Conexión a la base de datos
      await connectMongo();

      // Eliminar todos los empleados
      const result = await Empleado.deleteMany({});

      return NextResponse.json({
        message: "Todos los empleados han sido eliminados exitosamente",
        deletedCount: result.deletedCount,
      });
    } catch (error) {
      console.error("Error al eliminar empleados:", error);
      return NextResponse.json(
        { message: "Error al eliminar empleados" },
        { status: 500 }
      );
    }
  }
