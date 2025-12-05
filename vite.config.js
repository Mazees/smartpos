import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import mkcert from "vite-plugin-mkcert";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    mkcert(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Burger Kudapan", // Nama yang muncul di splash screen
        short_name: "SmartPOS Kudapan", // Nama yang muncul di bawah ikon aplikasi

        // Pengaturan Warna
        theme_color: "#fcb700", // Warna toolbar browser/status bar
        background_color: "#ffffff", // Warna background pada splash screen saat aplikasi dibuka

        // Pengaturan Ikon (Wajib ada minimal ukuran 192x192 dan 512x512)
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
    }),
  ],
});
