import { NextRequest, NextResponse } from "next/server";
import { jwtVerify, JWTPayload } from "jose";

interface CustomJWTPayload extends JWTPayload {
  rol?: string;
}

export async function middleware(request: NextRequest) {
  console.log("🔹 Middleware ejecutado en:", request.nextUrl.pathname);

  const token = request.cookies.get("token")?.value;

  if (!token) {
    console.log("⛔ Token no encontrado. Redirigiendo al login.");
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  try {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error("⛔ La clave secreta no está definida.");
    }

    // Verificar el token
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(secretKey)
    ) as { payload: CustomJWTPayload };

    // **🚀 IMPRIMIR TOKEN DECODIFICADO PARA DEPURACIÓN**
    console.log("✅ Token válido:", payload);

    const pathname = request.nextUrl.pathname;

    // **Verifica si el rol está presente**
    if (!payload.rol) {
      console.log("⚠️ El token no tiene un rol definido:", payload);
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // **Ruta Dashboard (cualquier usuario autenticado puede acceder)**
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.next();
    }

    // **Ruta Admin (solo Super y Administrador)**
    if (pathname.startsWith("/admin")) {
      if (!["Super", "Administrador"].includes(payload.rol)) {
        console.log(`⛔ Acceso denegado a /admin para rol: ${payload.roe}`);
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
      console.log(`✅ Acceso permitido a /admin para rol: ${payload.rol}`);
      return NextResponse.next();
    }

    // **Protección de API**
    if (pathname.startsWith("/api/protected")) {
      console.log("🔹 Ruta protegida API accedida por:", payload);
      return NextResponse.next();
    }

    return NextResponse.next();
  } catch (error) {
    console.log("⛔ Error al verificar el token:", error);
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/protected/:path*"],
};
