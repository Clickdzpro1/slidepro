import path from "node:path";
import { fileURLToPath } from "node:url";

const nextjsRoot = path.dirname(fileURLToPath(import.meta.url));
const isElectronBuild = process.env.PRESENTON_ELECTRON_BUILD === "true";
// When deployed as a Vercel microfrontend (proxied under /slidepro on
// work.clickdz.ai), set basePath so all routes, assets, and links resolve
// correctly under the sub-path. The Docker image (root-served) leaves this
// unset. NEXT_PUBLIC_BASE_PATH is set only on the Vercel project env.
const microfrontendBasePath = process.env.NEXT_PUBLIC_BASE_PATH?.trim() || undefined;

const nextConfig = {
  reactStrictMode: false,
  distDir: ".next-build",
  output: "standalone",
  ...(microfrontendBasePath ? { basePath: microfrontendBasePath } : {}),
  turbopack: {
    root: nextjsRoot,
  },
  ...(process.env.NODE_ENV !== "production"
    ? {
        allowedDevOrigins: [
          "127.0.0.1",
          "localhost",
        ],
      }
    : {}),

  images: {
    // A packaged Electron app is installed under a read-only directory such as
    // /opt/Presenton. Next's optimizer writes to <distDir>/cache, so emit direct
    // image URLs for that build instead of attempting runtime cache writes.
    unoptimized: isElectronBuild,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-7c765f3726084c52bcd5d180d51f1255.r2.dev",
      },
      {
        protocol: "https",
        hostname: "pptgen-public.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "pptgen-public.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "present-for-me.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "yefhrkuqbjcblofdcpnr.supabase.co",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
    ],
  },
  
};

export default nextConfig;
