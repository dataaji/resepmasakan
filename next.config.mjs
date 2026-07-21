/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Cegah situs di-embed di iframe orang lain (anti-clickjacking)
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Cegah browser menebak-nebak tipe file (anti MIME-sniffing)
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Batasi info referrer yang dikirim ke situs lain
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Matikan akses fitur sensitif yang tidak dipakai
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Paksa HTTPS (Vercel selalu HTTPS)
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
