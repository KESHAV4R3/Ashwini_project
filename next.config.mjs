/** @type {import('next').NextConfig} */
const nextConfig = {
  // pdf-parse uses Node.js native modules — must run server-side only
  serverExternalPackages: ["pdfjs-dist"],

  // Increase API body size limit for PDF uploads
  experimental: {},
};

export default nextConfig;
