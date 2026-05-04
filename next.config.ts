import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    // After ADR-0028 (route consolidation) the standalone /tone, /lab, /jd
    // routes were collapsed into anchored sections on /. 308 redirects
    // preserve any inbound links and tell crawlers the canonical URL moved.
    return [
      { source: "/jd", destination: "/#jd", permanent: true },
      { source: "/tone", destination: "/#tone", permanent: true },
      { source: "/lab", destination: "/#lab", permanent: true },
    ];
  },
};

export default nextConfig;
