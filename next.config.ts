import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "api.dicebear.com" },
      { protocol: "https", hostname: "commons.wikimedia.org" },
      { protocol: "https", hostname: "upload.wikimedia.org" },
      { protocol: "https", hostname: "static.inaturalist.org" },
      { protocol: "https", hostname: "inaturalist-open-data.s3.amazonaws.com" },
    ],
  },
};

export default nextConfig;
