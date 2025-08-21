/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    output: 'export',               // <-- key: static export
  images: { unoptimized: true },  // <-- if you use next/image
};

export default nextConfig;
