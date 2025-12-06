# SmartPOS - Sistem Kasir Modern

SmartPOS adalah aplikasi Point of Sale (POS) berbasis web yang modern dan responsif, dibangun menggunakan React dan Supabase. Aplikasi ini dirancang untuk memudahkan manajemen pesanan, produk, kategori, dan laporan penjualan untuk usaha kecil hingga menengah (UMKM), khususnya kuliner.

## 🚀 Fitur Utama

*   **Manajemen Pesanan (Point of Sale)**:
    *   Antarmuka kasir yang intuitif dengan pengelompokan kategori menu.
    *   **Pesanan Manual**: Input item kustom (misal: Ongkir) dengan harga fleksibel.
    *   Sistem keranjang belanja.
    *   Dukungan pembayaran Tunai dan QRIS.
    *   Kalkulasi kembalian otomatis.
*   **Manajemen Produk & Kategori**:
    *   Tambah, Edit, dan Hapus produk.
    *   Pengaturan status ketersediaan produk.
    *   Manajemen kategori produk.
*   **Riwayat Penjualan**:
    *   Melihat daftar riwayat penjualan.
    *   Detail transaksi lengkap.
*   **Smart Order AI (Segera Hadir)**:
    *   Input pesanan melalui teks natural yang diproses oleh AI (misal: "2 Burger dan 1 Es Teh").
    *   Konversi otomatis dari teks langsung ke keranjang belanja.
*   **Struk Digital**:
    *   Cetak struk (Print).
    *   Download struk sebagai gambar.
    *   Bagikan struk (Share API / WhatsApp).
*   **Laporan**:
    *   Ringkasan laporan penjualan (Fitur ini sedang dikembangkan).
*   **Realtime Updates**:
    *   Sinkronisasi data menu dan pesanan secara realtime menggunakan Supabase.
*   **Autentikasi**:
    *   Login aman untuk admin/kasir.
*   **Progressive Web App (PWA)**:
    *   Dapat diinstal di perangkat (Android, iOS, Desktop) layaknya aplikasi native.
    *   Pengalaman pengguna yang responsif dan cepat.

## 🛠️ Tech Stack

*   **Frontend Framework**: [React](https://react.dev/) (v19)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4) & [DaisyUI](https://daisyui.com/) (v5)
*   **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime)
*   **Routing**: [React Router](https://reactrouter.com/) (v7)
*   **Utilities**:
    *   `html-to-image`: Untuk generate struk menjadi gambar.
    *   `framer-motion`: Untuk animasi antarmuka.

## 📋 Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda telah menginstal:

*   [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan)
*   Akun [Supabase](https://supabase.com/) untuk database dan backend.

## ⚙️ Instalasi & Konfigurasi

1.  **Clone repositori ini**
    ```bash
    git clone https://github.com/username/smartpos.git
    cd smartpos
    ```

2.  **Instal dependensi**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variables**
    Buat file `.env` di root direktori proyek dan isi dengan konfigurasi Supabase Anda:

    ```env
    VITE_SUPABASE_URL=https://your-project-url.supabase.co
    VITE_SUPABASE_KEY=your-anon-key
    VITE_NAMA_TOKO="Nama Toko"
    ```

4.  **Jalankan aplikasi (Development)**
    ```bash
    npm run dev
    ```
    Aplikasi akan berjalan di `http://localhost:5173`.

## 🗂️ Struktur Proyek

```
src/
├── api/            # Konfigurasi dan fungsi API Supabase
├── assets/         # Gambar dan aset statis
├── components/     # Komponen React yang dapat digunakan kembali (Header, Alert, dll)
├── contexts/       # React Context (AuthContext, CartContext)
├── pages/          # Halaman-halaman utama aplikasi (Orders, History, Products, dll)
├── App.jsx         # Komponen utama dan konfigurasi Routing
└── main.jsx        # Entry point aplikasi
```

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan buat *Pull Request* atau laporkan *Issue* jika Anda menemukan bug atau memiliki saran fitur baru.

## 📄 Lisensi

[APACHE 2.0](LICENSE)
