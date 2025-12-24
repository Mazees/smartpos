# SmartPOS - Sistem Kasir Modern

SmartPOS adalah aplikasi Point of Sale (POS) berbasis web yang modern dan responsif, dibangun menggunakan React dan Supabase. Aplikasi ini dirancang untuk memudahkan manajemen pesanan, produk, kategori, dan laporan penjualan untuk usaha kecil hingga menengah (UMKM), khususnya kuliner.

## 🚀 Fitur Utama

- **Manajemen Pesanan (Point of Sale)**:
  - Antarmuka kasir yang intuitif dengan pengelompokan kategori menu
  - **Pesanan Manual**: Input item kustom (misal: Ongkir) dengan harga fleksibel
  - **Variant Menu**: Dukungan variant produk (Level Pedas, Topping, Ukuran, dll) dengan multiple/single selection
  - Sistem keranjang belanja dengan flow lengkap (Cart → Detail → Payment → Transaction)
  - Dukungan pembayaran Tunai dan **QRIS Dinamis** (auto-generate berdasarkan total harga)
  - Kalkulasi kembalian otomatis
  - Edit pesanan di keranjang (qty, variant, catatan)
- **Manajemen Produk & Kategori**:
  - Tambah, Edit, dan Hapus produk
  - Pengaturan status ketersediaan produk
  - Manajemen kategori produk (CRUD lengkap)
  - **Manajemen Variant**: Buat variant dengan multiple options, harga, dan aturan required/multiple
  - Assign variant ke produk
  - Upload gambar produk
- **Riwayat Penjualan**:
  - Melihat daftar riwayat penjualan
  - Detail transaksi lengkap dengan struk digital
  - Informasi variant yang dipilih di setiap item
- **Smart Order (AI)**:
  - Input pesanan melalui teks natural yang diproses oleh AI (misal: "2 Burger level pedas sedang, topping cheese")
  - Deteksi variant otomatis dari input natural language
  - Konversi otomatis dari teks langsung ke keranjang belanja
  - Powered by Groq AI melalui Netlify Functions
- **Struk Digital**:
  - Cetak struk (Print)
  - Download struk sebagai gambar
  - Bagikan struk (Share API / WhatsApp)
  - **QRIS Dinamis**: Generate QR Code pembayaran dengan total harga otomatis
- **Laporan**:
  - Ringkasan laporan penjualan (Fitur ini sedang dikembangkan)
- **Realtime Updates**:
  - Sinkronisasi data menu, variant, dan pesanan secara realtime menggunakan Supabase Realtime
- **Autentikasi**:
  - Login aman untuk admin/kasir menggunakan Supabase Auth
  - Protected routes untuk semua halaman utama
- **Progressive Web App (PWA)**:
  - Dapat diinstal di perangkat (Android, iOS, Desktop) layaknya aplikasi native
  - Pengalaman pengguna yang responsif dan cepat
  - Offline-ready dengan service worker

## 🛠️ Tech Stack

- **Frontend Framework**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/) (v7)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (v4) & [DaisyUI](https://daisyui.com/) (v5)
- **Backend / Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Realtime)
- **Routing**: [React Router DOM](https://reactrouter.com/) (v7)
- **Deployment**: [Netlify](https://netlify.com/) (dengan Netlify Functions untuk AI)
- **AI Integration**: [Groq SDK](https://groq.com/) untuk Smart Order
- **Utilities**:
  - `html-to-image`, `dom-to-image-more`, `html2canvas`: Generate struk menjadi gambar
  - `framer-motion`: Animasi antarmuka yang smooth
  - `react-to-print`, `react-thermal-printer`: Printing struk
  - `bluetooth-print-js`: Bluetooth printing support
  - `downloadjs`: Download file helper
  - `tailwind-scrollbar-hide`: Custom scrollbar styling

## 📋 Prasyarat

Sebelum menjalankan proyek ini, pastikan Anda telah menginstal:

- [Node.js](https://nodejs.org/) (Versi 18+ direkomendasikan)
- [npm](https://www.npmjs.com/) atau package manager lainnya
- Akun [Supabase](https://supabase.com/) untuk database dan backend
- Akun [Groq](https://groq.com/) untuk AI Smart Order (opsional)
- Akun [Netlify](https://netlify.com/) untuk deployment (opsional)

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

    Buat file `.env` di root direktori proyek dan isi dengan konfigurasi berikut:

    ```env
    # Supabase Configuration
    VITE_SUPABASE_URL=https://your-project-url.supabase.co
    VITE_SUPABASE_KEY=your-anon-key

    # Store Configuration
    VITE_NAMA_TOKO="Nama Toko Anda"

    # Groq AI Configuration (untuk Smart Order)
    GROQ_API_KEY=your-groq-api-key
    ```

4.  **Setup Database Supabase**

    Buat tabel-tabel berikut di Supabase:

    - `menu` - untuk data produk/menu
    - `kategori` - untuk kategori produk
    - `pesanan` - untuk data pesanan/transaksi
    - `detail_pesanan` - untuk detail item pesanan

    Aktifkan Realtime untuk tabel yang diperlukan.

5.  **Jalankan aplikasi (Development)**

    ```bash
    npm run dev
    ```

    Aplikasi akan berjalan di `http://localhost:5173`.

6.  **Jalankan dengan Netlify Dev (untuk testing AI functions)**
    ```bash
    npm install -g netlify-cli
    netlify dev
    ```
    Aplikasi akan berjalan di `http://localhost:8888` dengan Netlify Functions aktif.

## 🗂️ Struktur Proyek

```
smartpos/
├── netlify/
│   └── functions/          # Netlify Serverless Functions
│       └── chat-groq.js    # AI Smart Order endpoint
├── public/                 # Static assets
│   ├── icon.png           # App icon untuk PWA
│   ├── qris.png           # QRIS payment image
│   └── transaction_success.png
├── src/
│   ├── api/               # API layer dan Supabase client
│   │   ├── supabase.js    # Supabase configuration
│   │   ├── ai.js          # AI integration
│   │   └── ...
│   ├── assets/            # Images dan static files
│   ├── components/        # Reusable React components
│   │   ├── Header.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── ...
│   ├── contexts/          # React Context providers
│   │   ├── AuthContext.jsx
│   │   └── CartContext.jsx
│   ├── pages/             # Page components
│   │   ├── Orders.jsx     # Halaman kasir utama
│   │   ├── Cart.jsx       # Keranjang belanja
│   │   ├── Payment.jsx    # Halaman pembayaran
│   │   ├── Transaction.jsx # Struk transaksi
│   │   ├── History.jsx    # Riwayat penjualan
│   │   ├── Products.jsx   # Manajemen produk
│   │   ├── Kategori.jsx   # Manajemen kategori
│   │   ├── Reports.jsx    # Laporan (WIP)
│   │   ├── Login.jsx      # Halaman login
│   │   └── ...
│   ├── App.jsx            # Main app component dengan routing
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── .env                   # Environment variables (jangan commit!)
├── netlify.toml           # Netlify configuration
├── vite.config.js         # Vite configuration (PWA, HTTPS)
└── package.json           # Dependencies
```

## 🚢 Deployment

### Deploy ke Netlify

1.  **Push ke Git repository** (GitHub, GitLab, atau Bitbucket)

2.  **Connect ke Netlify**:

    - Login ke [Netlify](https://app.netlify.com/)
    - Klik "Add new site" → "Import an existing project"
    - Pilih repository Anda

3.  **Configure build settings**:

    - Build command: `npm run build`
    - Publish directory: `dist`
    - Functions directory: `netlify/functions`

4.  **Set environment variables** di Netlify dashboard:

    - `VITE_SUPABASE_URL`
    - `VITE_SUPABASE_KEY`
    - `VITE_NAMA_TOKO`
    - `GROQ_API_KEY`

5.  **Deploy!** Netlify akan otomatis build dan deploy aplikasi Anda.

## 📱 PWA Installation

Setelah aplikasi di-deploy, pengguna dapat menginstal SmartPOS sebagai aplikasi:

- **Android/iOS**: Buka di browser, tap menu → "Add to Home Screen"
- **Desktop**: Klik icon install di address bar browser

## 🔑 Fitur Routing

Aplikasi menggunakan React Router dengan protected routes:

- `/login` - Halaman login
- `/` - Halaman kasir utama (Orders)
- `/keranjang` - Keranjang belanja
- `/keranjang/detail-pesanan` - Detail pesanan
- `/keranjang/pembayaran` - Pembayaran
- `/keranjang/pembayaran/transaksi` - Struk transaksi
- `/kelola` - Manajemen toko
- `/kelola/kategori` - Manajemen kategori
- `/kelola/daftar-menu` - Manajemen produk
- `/riwayat` - Riwayat penjualan
- `/laporan` - Laporan (WIP)

## 🤝 Kontribusi

Kontribusi selalu diterima! Silakan:

1.  Fork repositori ini
2.  Buat branch fitur baru (`git checkout -b feature/AmazingFeature`)
3.  Commit perubahan Anda (`git commit -m 'Add some AmazingFeature'`)
4.  Push ke branch (`git push origin feature/AmazingFeature`)
5.  Buat Pull Request

Atau laporkan _Issue_ jika Anda menemukan bug atau memiliki saran fitur baru.

## � Credits

- **QRIS Dinamis Generator**: Implementasi QRIS dinamis menggunakan library dari [qris-dinamis-generator](https://github.com/Adytm404/qris-dinamis-generator) oleh [@Adytm404](https://github.com/Adytm404)

## �📄 Lisensi

[Apache License 2.0](LICENSE)

## 👨‍💻 Developer

Dibuat dengan ❤️ untuk UMKM Indonesia

---

**Note**: Proyek ini masih dalam pengembangan aktif. Beberapa fitur mungkin belum sempurna atau masih dalam tahap pengembangan.
