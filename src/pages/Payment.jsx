import { useState, useContext, useEffect, use, useRef } from "react";
import { CartContext } from "../contexts/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import Alert from "../components/Alert";
import * as htmlToImage from "html-to-image";
import { addOrderDetails, addOrders, addMembers } from "../api/api";
import { QRCodeSVG } from "qrcode.react";
import { generateDynamicQris } from "../api/payment.cjs";

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

  // Reusable payment submission handler
  const handlePaymentSubmit = async (cashAmount = null) => {
    const { data: orders, error } = await addOrders(
      namaPelanggan,
      totalHarga,
      cashAmount
    );

    if (error) {
      handleNotification(error.message, "error");
      return false;
    }

    const details = cart.map((item) => ({
      orders_id: orders[0].id,
      name: item.name,
      original_price: item.original_price,
      discount_price: item.discount_price,
      qty: item.qty,
      note: item.note,
      subtotal: item.subtotal,
      variants: item.variants,
    }));

    const { error: detailsError } = await addOrderDetails(details);
    if (detailsError) {
      handleNotification(detailsError.message, "error");
      return false;
    }

    if(namaPelanggan.length > 0){
      const { error: membersError } = await addMembers(namaPelanggan);
      if (membersError) {
        console.error("Gagal menambahkan member:", membersError);
      }
    }

    navigate("/keranjang/pembayaran/transaksi", {
      state: {
        orders: orders[0],
        details: details,
        qty: jumlahItem,
      },
    });

    return true;
  };

  return (
    <>
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
      {/* <h1 className="poppins-bold mt-5">
        Total Pembayaran: Rp {totalHarga.toLocaleString("id-ID")}
      </h1> */}
      <div className="w-full lg:h-[72vh] py-5 overflow-hidden lg:flex-row flex flex-col-reverse lg:gap-5 items-center">
        <div className="w-full lg:w-1/2 h-full flex flex-col gap-3 items-center justify-center">
          <div className="flex flex-col w-full lg:hidden">
            <button
              onClick={handleShare}
              className={`btn btn-outline w-full mx-auto poppins-bold mt-3 ${
                page === 2 ? "" : "hidden"
              }`}
            >
              BAGIKAN QRIS
            </button>
            <button
              onClick={() => handlePaymentSubmit(null)}
              className={`btn btn-secondary poppins-bold w-full mt-2 ${
                page === 2 ? "" : "hidden"
              }`}
            >
              SUDAH BAYAR
            </button>
          </div>
          {page === 2 ? (
            <div
              ref={captureRef}
              className="bg-secondary w-fit lg:h-full lg:aspect-[1.3/2] rounded-2xl p-6 overflow-hidden flex flex-col items-center justify-center"
            >
              <div className="flex items-center gap-3 mb-2">
                <img src="/icon.png" className="size-20 lg:size-13" />
                <div className="text-left">
                  <h2 className="poppins-bold text-white text-sm not-lg:text-lg">
                    BURGER & KEBAB KUDAPAN
                  </h2>
                  <p className="text-white/80 text-sm poppins-regular">
                    Scan untuk bayar
                  </p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 mb-6 w-full">
                <p className="text-white/70 text-xs poppins-regular text-center mb-1">
                  Total Pembayaran
                </p>
                <p className="poppins-bold text-warning text-lg text-center">
                  Rp {totalHarga.toLocaleString("id-ID")}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-white shadow-lg">
                <QRCodeSVG
                  className="lg:size-[180px] size-[250px]"
                  value={generateDynamicQris(totalHarga)}
                />
              </div>
              <div className="mt-6 text-center">
                <img
                  src="https://s6.imgcdn.dev/YUpUDK.png"
                  className="w-[100px] mx-auto"
                  alt="qris"
                />
              </div>
            </div>
          ) : (
            <form className="w-full h-full">
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
                  }
                  await handlePaymentSubmit(cash);
                }}
                className="btn btn-secondary poppins-bold w-full mt-2"
              >
                BAYAR
              </button>
            </form>
          )}
        </div>
        <div className="lg:w-1/2 not-lg:hidden h-full w-full h-fit">
          <div className="bg-base-200 h-full flex flex-col rounded-lg p-4 mb-4">
            <h1 className="poppins-bold text-xl mb-4">ORDER SUMMARY</h1>

            {/* Summary Info */}
            <div className="flex justify-between mb-2 pb-2 border-b border-base-300">
              <span className="poppins-medium">Jumlah Item:</span>
              <span className="poppins-bold">{jumlahItem} item</span>
            </div>

            {/* Cart Items */}
            <div className="space-y-3 mb-4 flex-1 overflow-y-auto">
              {cart.map((item, index) => (
                <div key={index} className="bg-base-100 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-1">
                    <span className="poppins-medium text-sm flex-1">
                      {item.name}
                    </span>
                    <span className="poppins-bold text-sm ml-2">
                      x{item.qty}
                    </span>
                  </div>
                  <div className="poppins-regular text-base-content/70 text-xs flex flex-col gap-1 mt-1">
                    {item.variants?.map((vart, idx) => {
                      const variantsName = vart.name;
                      const optionsName = vart.options
                        .map((opt) => opt.name)
                        .join(", "); // ← Join dengan comma
                      return (
                        <div key={idx}>
                          {variantsName}: {optionsName}
                        </div>
                      );
                    })}
                    {item.note && <div>Catatan: {item.note}</div>}
                  </div>

                  {/* Price */}
                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-base-300">
                    <span className="text-xs poppins-regular text-base-content/70">
                      @ Rp{" "}
                      {(
                        item.discount_price || item.original_price
                      ).toLocaleString("id-ID")}
                    </span>
                    <span className="poppins-bold">
                      Rp {item.subtotal.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center pt-3 border-t-2 border-base-300">
              <span className="poppins-bold text-lg">Total Pembayaran:</span>
              <span className="poppins-bold text-xl">
                Rp {totalHarga.toLocaleString("id-ID")}
              </span>
            </div>
            <button
              onClick={() => handlePaymentSubmit(null)}
              className={`btn btn-secondary poppins-bold w-full mt-2 ${
                page === 2 ? "" : "hidden"
              }`}
            >
              SUDAH BAYAR
            </button>
            <button
              onClick={handleShare}
              className={`btn btn-outline w-full mx-auto poppins-bold mt-3 ${
                page === 2 ? "" : "hidden"
              }`}
            >
              BAGIKAN QRIS
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Payment;
