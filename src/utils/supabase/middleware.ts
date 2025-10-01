import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  const url = request.nextUrl;
  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, { ...options, path: "/" });
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const isRecoveryCookie = request.cookies.get("IsRecovery")?.value === "true";
  const isRecoveryLink = url.searchParams.get("type") === "recovery";
 // ✅ Liberar todas as rotas da API sem passar por regras de auth
  if (url.pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  // Rotas públicas
  const publicRoutesForLoggedOut = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/confirmed",
    "/error",
    "/shopping-list" // Mantendo apenas para compatibilidade com rotas dinâmicas
  ];

  // Rotas que podem ser acessadas mesmo logado
  const alwaysAccessibleRoutes = [
    "/shopping-list" // Mantendo apenas para compatibilidade com rotas dinâmicas
  ];

  const recoveryRoute = "/reset-password";
  const homeRoute = "/";
  const internalRoute = "/lists";
  // console.log(isRecoveryCookie);
  // 1️⃣ Se vier do link de recovery → setar cookie e deixar o usuário na página
  if (url.pathname === recoveryRoute && isRecoveryLink && !isRecoveryCookie) {
    response.cookies.set("IsRecovery", "true", {
      path: "/",
      httpOnly: false,
      maxAge: 60 * 60, // 1h
    });
    return response; // ⚡ Não redireciona, só seta o cookie
  }

  // 2️⃣ Bloquear /reset-password se não tiver cookie de recovery
  if (url.pathname === recoveryRoute && !isRecoveryCookie) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // 3️⃣ Bloquear outras páginas durante recovery
  if (user && isRecoveryCookie && url.pathname !== recoveryRoute && url.pathname !== '/login') {
    // console.log('acessou outra rota');
    const redirectUrl = url.clone();
    redirectUrl.pathname = recoveryRoute;
    return NextResponse.redirect(redirectUrl);
  }

  // 4️⃣ Usuário logado sem cookie tentando acessar rotas públicas (exceto / e rotas sempre acessíveis)
  if (
    user &&
    !isRecoveryCookie &&
    publicRoutesForLoggedOut.some((path) => url.pathname.startsWith(path)) &&
    !alwaysAccessibleRoutes.some((path) => url.pathname.startsWith(path))
  ) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = internalRoute;
    return NextResponse.redirect(redirectUrl);
  }

  // 5️⃣ Usuário não logado tentando acessar rota privada
  const isPrivateRoute =
    !publicRoutesForLoggedOut.includes(url.pathname) &&
    url.pathname !== recoveryRoute &&
    url.pathname !== homeRoute;

  if (!user && isPrivateRoute) {
    const redirectUrl = url.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  // 6️⃣ Se acessar /login → limpar o cookie de recovery
  if (url.pathname === "/login" && isRecoveryCookie) {
    // console.log('acessou /login');
    response.cookies.delete("IsRecovery");
    // console.log('cookie removido');
  }

  // // 7️⃣ Se usuário deslogou mas o cookie ainda existe → limpar
  // if (!user && isRecoveryCookie) {
  //   response.cookies.delete("IsRecovery");
  // }

  return response;
}
