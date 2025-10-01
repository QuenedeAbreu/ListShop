// /pages/api/clear-recovery-cookie.ts
import { NextApiRequest, NextApiResponse } from "next";
import { NextResponse } from "next/server";

export async function POST(req: NextApiRequest, res: NextApiResponse) {
    console.log("Limpando cookie...");

  const response = NextResponse.json({ message: "Cookie IsRecovery removido" });

  // Deleta o cookie IsRecovery
  response.cookies.set("IsRecovery", "", {
    path: "/",
    httpOnly: true,
    maxAge: 0,
    sameSite: "lax",
  });

  return response;
}
