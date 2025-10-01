"use client";

// import { useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function ConfirmedPage() {

  // const router = useRouter();
  // const params = useSearchParams();
  // useEffect(() => {
  //   const accessToken = params.get("token");
  //   const type = params.get("type");

  //   // ✅ só deixa ver a página se veio do Supabase
  //   if (!accessToken || type !== "signup") {
  //     router.replace("/login"); // redireciona se for acesso direto
  //   }
  // }, [router, params]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow text-center max-w-sm w-full">
        <h1 className="text-2xl font-bold mb-4 text-green-600">
          🎉 Conta confirmada!
        </h1>
        <p className="text-gray-600 mb-6">
          Seu e-mail foi confirmado com sucesso.
        </p>
        <Link
          href="/login"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
        >
          Ir para Login
        </Link>
      </div>
    </div>
  );
}
