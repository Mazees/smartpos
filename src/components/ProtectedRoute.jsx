import Loading from "./Loading";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Impor hook yang sudah dibuat
import Header from "./Header";

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth();

  // 1. Tampilkan status loading saat Supabase masih memeriksa sesi awal.
  if (loading) {
    // Show nicer loading UI while we verify the session
    return (
      <Header title="Memeriksa Sesi...">
        <div
          role="status"
          aria-live="polite"
          className="min-h-[60vh] flex items-center justify-center"
        >
          <Loading message="Memuat sesi..." />
        </div>
      </Header>
    );
  }

  // 2. Pengecekan Kunci (Data Sesi)
  // Jika tidak ada sesi (pengguna belum login), arahkan ke halaman /login.
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // 3. Jika sesi ada, izinkan pengguna melihat rute yang dilindungi.
  return children;
}
