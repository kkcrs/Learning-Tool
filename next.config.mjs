/** @type {import('next').NextConfig} */
const nextConfig = {
  /** 与部署构建一致：ESLint / 类型错误均阻断构建 */
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
