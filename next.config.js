/** @type {import('next').NextConfig} */
const nextConfig = {
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
    // !! WARN !!
    // Ignorar erros de tipagem durante o build para produção
    // Isso não é recomendado a menos que você saiba o que está fazendo
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig