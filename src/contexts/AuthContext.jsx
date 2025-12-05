import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../api/supabase';
import { useNavigate } from 'react-router-dom'; // Untuk redirect di ProtectedRoute

// 1. Buat Konteks
const AuthContext = createContext({ 
  session: null, 
  loading: true 
});

// Hook kustom untuk memudahkan penggunaan
export const useAuth = () => useContext(AuthContext);

// 2. Komponen Provider (Penyedia Nilai)
export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // useEffect akan berjalan saat komponen dimuat
  useEffect(() => {
    // 3. Ambil Sesi Saat Ini
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 4. Setup Listener (Pemantau) Real-time
    // Ini memastikan status terupdate jika user login/logout di tab lain
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setLoading(false);
      }
    );

    // Bersihkan listener saat komponen dilepas
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Nilai yang akan dibagikan ke seluruh aplikasi
  const value = {
    session,
    loading,
    // Kita bisa tambahkan fungsi login/logout di sini juga
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};