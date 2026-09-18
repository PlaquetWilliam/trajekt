import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Hébergeurs d'images autorisés pour les photos des destinations.
    // Ajoutez ici le vôtre si vous en utilisez un autre.
    remotePatterns: [
      new URL("https://res.cloudinary.com/**"),
      new URL("https://images.unsplash.com/**"),
    ],
  },
};

export default nextConfig;
