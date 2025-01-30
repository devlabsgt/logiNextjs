import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { message: "Sesión cerrada correctamente" },
    {
      headers: {
        "Set-Cookie": `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`,
      },
    }
  );

  return response;
}
