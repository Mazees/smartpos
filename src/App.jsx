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

function App() {
  return (
    <>
      <AuthProvider>
        <CartProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/keranjang"
                element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/keranjang/detail-pesanan"
                element={
                  <ProtectedRoute>
                    <DetailOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/keranjang/pembayaran"
                element={
                  <ProtectedRoute>
                    <Payment />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/keranjang/pembayaran/transaksi"
                element={
                  <ProtectedRoute>
                    <Transaction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola"
                element={
                  <ProtectedRoute>
                    <ManageStore />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/kategori"
                element={
                  <ProtectedRoute>
                    <Kategori />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/kategori/tambah-kategori"
                element={
                  <ProtectedRoute>
                    <AddKategori />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/kategori/edit-kategori"
                element={
                  <ProtectedRoute>
                    <AddKategori />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/daftar-menu"
                element={
                  <ProtectedRoute>
                    <Products />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/daftar-menu/tambah-menu"
                element={
                  <ProtectedRoute>
                    <AddProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kelola/daftar-menu/edit-menu"
                element={
                  <ProtectedRoute>
                    <AddProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/riwayat"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/riwayat/detail-transaksi"
                element={
                  <ProtectedRoute>
                    <Transaction />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/laporan"
                element={
                  <ProtectedRoute>
                    <Reports />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </CartProvider>
      </AuthProvider>
    </>
  );
}

export default App;
