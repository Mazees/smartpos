import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";
import { useState, useContext, useEffect, use, useRef } from "react";
import { CartContext } from "../contexts/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import Alert from "../components/Alert";
import * as htmlToImage from "html-to-image";
import { addOrderDetails, addOrders, addMembers } from "../api/api";

const Payment = () => {
  const [page, setPage] = useState(1);
  const captureRef = useRef();
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

  const handleShare = () => {
    const node = captureRef.current;
    htmlToImage.toBlob(node).then(async function (blob) {
      const shareData = {
        files: [new File([blob], `payment-qris.png`, { type: blob.type })],
        title: "QRIS",
        text: `Mohon Bayar Sebesar: Rp ${totalHarga.toLocaleString("id-ID")}`,
      };
      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        console.log("Berhasil membagikan gambar!");
      } else {
        console.log("Browser tidak mendukung pembagian file ini.");
      }
    });
  };

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
      <h1 className="poppins-bold mt-5">
        Total Pembayaran: Rp {totalHarga.toLocaleString("id-ID")}
      </h1>
      {page === 1 ? (
        <form className="w-full lg:w-1/2">
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
        <div className="w-full flex flex-col items-center">
          <button
            onClick={handleShare}
            className="btn w-full lg:w-[300px] mx-auto poppins-bold mt-3"
          >
            BAGIKAN QRIS
          </button>
          <div
            ref={captureRef}
            className="bg-secondary rounded-4xl p-3 lg:w-[300px] overflow-hidden flex flex-col items-center  justify-center"
          >
            <div className="poppins-regular text-primary-content mb-2">
              Mohon Bayar Sebesar: Rp {totalHarga.toLocaleString("id-ID")}
            </div>
            <img className="w-full rounded-4xl" src="/qris.png" alt="QRIS" />
          </div>
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
