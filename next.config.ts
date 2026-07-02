import type { NextConfig } from "next";

const extraDevOrigins =
  process.env.NEXT_DEV_ALLOWED_ORIGINS?.split(",").map((o) => o.trim()).filter(Boolean) ??
  [];

const nextConfig: NextConfig = {
  // Fix dev WebSocket/HMR when visiting via 127.0.0.1 instead of localhost
  allowedDevOrigins: ["127.0.0.1", ...extraDevOrigins],
};

export default nextConfig;
