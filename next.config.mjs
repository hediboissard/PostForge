/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    // Force le root de Turbopack sur le cwd de Next
    root: process.cwd(),
  },
};

export default nextConfig;


