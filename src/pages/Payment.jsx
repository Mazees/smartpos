import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";
import { useState, useContext, useEffect, use } from "react";
import { CartContext } from "../contexts/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import Alert from "../components/Alert";
import { addOrderDetails, addOrders, addMembers } from "../api/api";

const Payment = () => {
  const [page, setPage] = useState(1);
  const { cart, setCart } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [totalHarga, setTotalHarga] = useState(location.state?.totalHarga || 0);
  const [namaPelanggan, setNamaPelanggan] = useState(
    location.state?.namaPelanggan || ""
  );
  const [jumlahItem, setJumlahItem] = useState(location.state?.jumlahItem || 0);
  const [kembalian, setKembalian] = useState(0);
  const [cash, setCash] = useState();
  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });

  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 1500);
  };

  useEffect(() => {
    setTotalHarga(cart.reduce((total, item) => total + item.subtotal, 0));
    setJumlahItem(cart.reduce((total, item) => total + item.qty, 0));
    if (cart.length === 0) navigate("/");
  }, [cart]);

  return (
    <Header title="Pembayaran">
      <Alert message={notification.message} variant={notification.variant} />
      <div role="tablist" className="tabs tabs-box">
        <a
          role="tab"
          className={`tab w-1/2 ${page === 1 ? "tab-active" : ""}`}
          onClick={() => setPage(1)}
        >
          Cash
        </a>
        <a
          role="tab"
          className={`tab w-1/2 ${page === 2 ? "tab-active" : ""}`}
          onClick={() => setPage(2)}
        >
          QRIS
        </a>
      </div>
      {page === 1 ? (
        <form className="w-full mt-5 lg:w-1/2 mx-auto">
          <fieldset className="fieldset">
            <legend className="fieldset-legend w-full">
              Berapa uang pelanggan?
            </legend>
            <input
              type="number"
              className="input w-full"
              placeholder="Masukkan jumlah uang"
              required
              value={cash}
              onChange={(e) => {
                setCash(e.target.value);
                setKembalian(e.target.value - totalHarga);
              }}
            />
            <p className="label">Kembalian: {kembalian}</p>
          </fieldset>
          <button
            onClick={(e) => {
              e.preventDefault();
              setCash(totalHarga);
              setKembalian(0);
            }}
            className="btn btn-outline poppins-bold w-full mt-2"
          >
            UANG PAS
          </button>
          <button
            type="submit"
            onClick={async (e) => {
              e.preventDefault();
              if (cash < totalHarga) {
                handleNotification("Uang tidak cukup", "error");
                return;
              } else {
                const { data: orders, error } = await addOrders(
                  namaPelanggan,
                  totalHarga,
                  cash
                );
                if (error) {
                  handleNotification(error.message, "error");
                } else {
                  const details = cart.map((item) => ({
                    orders_id: orders[0].id,
                    name: item.name,
                    original_price: item.original_price,
                    discount_price: item.discount_price,
                    qty: item.qty,
                    note: item.note,
                    subtotal: item.subtotal,
                  }));
                  const { error: detailsError } = await addOrderDetails(
                    details
                  );
                  if (detailsError) {
                    handleNotification(detailsError.message, "error");
                  } else {
                    const { error: membersError } = await addMembers(
                      namaPelanggan
                    );
                    if (membersError) {
                      console.error("Gagal menambahkan member:", membersError);
                    } else {
                      navigate("/keranjang/pembayaran/transaksi", {
                        state: {
                          orders: orders[0],
                          details: details,
                          qty: jumlahItem,
                        },
                      });
                    }
                  }
                }
              }
            }}
            className="btn btn-secondary poppins-bold w-full mt-2"
          >
            BAYAR
          </button>
        </form>
      ) : page == 2 ? (
        <div className="w-full">
          <img
            className="rounded-3xl my-5 lg:w-[300px] mx-auto w-full"
            src="/qris.png"
            alt="QRIS"
          />
          <button
            onClick={async () => {
              const { data: orders, error } = await addOrders(
                namaPelanggan,
                totalHarga,
                null
              );
              if (error) {
                handleNotification(error.message, "error");
              } else {
                const details = cart.map((item) => ({
                  orders_id: orders[0].id,
                  name: item.name,
                  original_price: item.original_price,
                  discount_price: item.discount_price,
                  qty: item.qty,
                  note: item.note,
                  subtotal: item.subtotal,
                }));
                const { error: detailsError } = await addOrderDetails(details);
                if (detailsError) {
                  handleNotification(detailsError.message, "error");
                } else {
                  const { error: membersError } = await addMembers(
                    namaPelanggan
                  );
                  if (membersError) {
                    console.error("Gagal menambahkan member:", membersError);
                  } else {
                    navigate("/keranjang/pembayaran/transaksi", {
                      state: {
                        orders: orders[0],
                        details: details,
                        qty: jumlahItem,
                      },
                    });
                  }
                }
              }
            }}
            className="btn btn-secondary poppins-bold w-full mt-2"
          >
            SUDAH BAYAR
          </button>
        </div>
      ) : (
        ""
      )}
    </Header>
  );
};

export default Payment;
