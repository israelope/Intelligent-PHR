/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // pdf-parse loads a pdf.js worker at runtime; keep it external so Next's
  // server bundle doesn't try to inline the worker files.
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
};

module.exports = nextConfig;
