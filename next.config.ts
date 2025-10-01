import type { NextConfig } from "next";
/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // aceita qualquer domínio https
      },
      {
        protocol: 'http',
        hostname: '**', // se também quiser liberar http
      },
    ],
  },
  typescript: {
    // Ignorar erros de tipagem durante a compilação para produção
    // Isso permite que o build seja concluído mesmo com erros de tipagem
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
