import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Orders from "./pages/Orders";
import Products from "./pages/Products";
import History from "./pages/History";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AddProducts from "./pages/AddProducts";
import ManageStore from "./pages/ManageStore";
import Kategori from "./pages/Kategori";
import AddKategori from "./pages/AddKategori";
import { CartProvider } from "./contexts/CartContext";
import Cart from "./pages/Cart";
import DetailOrders from "./pages/DetailOrders";
import Payment from "./pages/Payment";
import Transaction from "./pages/Transaction";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Variant from "./pages/Variant";
import AddVariant from "./pages/AddVariant";
import Header from "./components/Header";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Header title="Buat Pesanan">
                      <Orders />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/keranjang"
                element={
                  <ProtectedRoute>
                    <Header title="Keranjang Pesanan">
                      <Cart />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/keranjang/detail-pesanan"
                element={
                  <ProtectedRoute>
                    <Header title="Detail Pesanan">
                      <DetailOrders />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/keranjang/pembayaran"
                element={
                  <ProtectedRoute>
                    <Header title="Pembayaran">
                      <Payment />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/keranjang/pembayaran/transaksi"
                element={
                  <ProtectedRoute>
                    <Header title="Transaksi">
                      <Transaction />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola"
                element={
                  <ProtectedRoute>
                    <Header title="Kelola Toko">
                      <ManageStore />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/kategori"
                element={
                  <ProtectedRoute>
                    <Header title="Daftar Kategori Menu">
                      <Kategori />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/kategori/tambah-kategori"
                element={
                  <ProtectedRoute>
                    <Header title="Edit/Tambah Kategori">
                      <AddKategori />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/kategori/edit-kategori"
                element={
                  <ProtectedRoute>
                    <Header title="Edit/Tambah Kategori">
                      <AddKategori />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/daftar-menu"
                element={
                  <ProtectedRoute>
                    <Header title="Daftar Menu">
                      <Products />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/daftar-menu/tambah-menu"
                element={
                  <ProtectedRoute>
                    <Header title="Edit/Tambah Menu">
                      <AddProducts />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/daftar-menu/edit-menu"
                element={
                  <ProtectedRoute>
                    <Header title="Edit/Tambah Menu">
                      <AddProducts />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/varian"
                element={
                  <ProtectedRoute>
                    <Header title="Varian Menu">
                      <Variant />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/daftar-menu/tambah-varian"
                element={
                  <ProtectedRoute>
                    <Header title="Tambah Varian">
                      <AddVariant />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/riwayat"
                element={
                  <ProtectedRoute>
                    <Header title="Riwayat Penjualan">
                      <History />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/riwayat/detail-transaksi"
                element={
                  <ProtectedRoute>
                    <Header title="Transaksi">
                      <Transaction />
                    </Header>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/laporan"
                element={
                  <ProtectedRoute>
                    <Header title="Laporan Penjualan">
                      <Reports />
                    </Header>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
