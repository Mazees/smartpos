import { useState, useRef, useEffect, useContext } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import * as htmlToImage from "html-to-image";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { CartContext } from "../contexts/CartContext";
import iconBase64 from "../api/iconBase64";

const Transaction = () => {
  const captureRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [dataOrders, setDataOrders] = useState(location.state?.orders || {});
  const [dataOrderDetails, setDataOrderDetails] = useState(
    location.state?.details || []
  );
  const { cart, setCart } = useContext(CartContext);
  const [jumlahItem, setJumlahItem] = useState(location.state?.qty || 0);
  const [dateOrdered, setDateOrdered] = useState(
    new Date(location.state?.orders.tgl_pembelian).toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  );

  const handlePrint = async () => {
    let str = `
<IMAGE>1#${iconBase64}<110><112>BURGER KUDAPAN
<110>#TRX-${dataOrders.id} ${dateOrdered}
<010>Nama Pelanggan: ${
      dataOrders.customer_name || "Umum"
    }<010>================================<000>${dataOrderDetails
      .map(
        (detail, index) =>
          `${index + 1}. ${detail.name}\n(Qty: ${detail.qty} x @ Rp ${
            detail.discount_price
              ? Number(detail.discount_price).toLocaleString("id-ID")
              : Number(detail.original_price).toLocaleString("id-ID")
          })\nSubtotal: Rp ${Number(detail.subtotal).toLocaleString("id-ID")} ${
            detail.note ? "\nCatatan: " + detail.note : ""
          }${index + 1 === dataOrderDetails.length ? "" : "\n"}`
      )
      .join(
        ""
      )}<010>================================<000>Jumlah Item: ${jumlahItem}x\nTotal Pembayaran: Rp ${Number(
      dataOrders.total_price
    ).toLocaleString("id-ID")}\nBayar (${
      dataOrders.cash ? "Tunai" : "QRIS"
    }): ${
      dataOrders.cash
        ? "Rp " + Number(dataOrders.cash).toLocaleString("id-ID")
        : "Lunas"
    }\nKembali: Rp ${Number(
      dataOrders.cash ? dataOrders.cash - dataOrders.total_price : 0
    ).toLocaleString(
      "id-ID"
    )}<010>================================ <110>Scan Menu:<QR>1#20#https://wa.me/c/6281240044516
    `;

    try {
      await navigator.share({ title: "Struk Transaksi", text: str });
      resultPara.textContent = "MDN shared successfully";
    } catch (err) {
      resultPara.textContent = `Error: ${err}`;
      alert("Sharing failed:", err);
    }
  };

  useEffect(() => {
    if (Object.keys(dataOrders).length !== 0) {
      setCart([]);
    } else {
      navigate("/");
    }
  }, []);

  const download = (dataurl, filename) => {
    const a = document.createElement("a");
    a.href = dataurl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCapture = () => {
    const node = captureRef.current;
    htmlToImage
      .toPng(node)
      .then((dataUrl) => download(dataUrl, `receipt-${dataOrders.id}.png`));
  };
  const handleShare = () => {
    const node = captureRef.current;
    htmlToImage.toBlob(node).then(async function (blob) {
      const shareData = {
        files: [
          new File([blob], `receipt-${dataOrders.id}.png`, { type: blob.type }),
        ],
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
    <>
      <img src="/kudapan.png" className="mx-auto my-5 size-30" alt="success" />
      <h1 className="poppins-bold w-full text-center text-lg">
        Transaksi Berhasil!
      </h1>
      <h1 className="poppins-light mx-auto text-center mt-3 text-sm py-2 px-4 bg-base-content text-white rounded-3xl">
        Tipe Pembayaran: {dataOrders.cash ? "Tunai" : "QRIS"}
      </h1>
      <div className="w-full flex justify-between mt-5 p-2 rounded-sm border">
        <h1 className="text-sm poppins-regular">PELANGGAN</h1>
        <h1 className="text-sm poppins-regular">{dataOrders.customer_name}</h1>
      </div>
      <div className="w-full flex justify-between p-2 rounded-sm border">
        <h1 className="text-sm poppins-regular">ID TRANSAKSI</h1>
        <h1 className="text-sm poppins-regular">#{dataOrders.id}</h1>
      </div>
      <div className="flex flex-col gap-3 justify-end w-full">
        <button
          className="btn w-full mt-5"
          onClick={() => document.getElementById("my_modal_4").showModal()}
        >
          E-RECEIPT
        </button>
        <dialog id="my_modal_4" className="modal overflow-y-scroll">
          <div className="modal-box h-[90%] overflow-y-scroll flex flex-col items-center w-full lg:w-lg scrollbar-hide">
            <div className="flex mt-5 justify-center w-full">
              <div
                ref={captureRef}
                className="flex flex-col justify-center w-full items-center bg-[#d3d3d3] text-black p-5 rounded-lg"
              >
                <img
                  src="/icon.png"
                  className="size-30"
                  alt="Burger Kudapan Logo"
                />
                <h1 className="text-xl poppins-bold">BURGER KUDAPAN</h1>
                <h1 className="poppins-light text-sm">{dateOrdered}</h1>
                <div className="w-full flex justify-between poppins-regular mt-10 text-sm">
                  <h1>Tipe Pembayaran</h1>
                  <h1>Tunai</h1>
                </div>
                {dataOrders.customer_name ? (
                  <div className="w-full flex border-b-[0.1px] pb-4 justify-between poppins-regular mt-4 text-sm">
                    <h1>Nama Pelanggan</h1>
                    <h1>{dataOrders.customer_name}</h1>
                  </div>
                ) : (
                  ""
                )}
                <div className="w-full flex flex-col border-b-[0.1px] pb-4">
                  <h1 className="poppins-bold mt-4">Daftar Pesanan:</h1>
                  {dataOrderDetails.map((item, idx) => (
                    <>
                      <h1 className="poppins-medium w-full mt-4 text-sm">
                        {item.name}
                      </h1>
                      <div
                        className={`w-full flex justify-between poppins-light text-xs mt-2`}
                      >
                        <h1
                          className={`${
                            item.discount_price !== 0
                              ? " opacity-50 line-through"
                              : ""
                          }`}
                        >
                          Rp{" "}
                          {Number(item.original_price).toLocaleString("id-ID")}
                        </h1>
                        {item.discount_price === 0 && <h1>{item.qty}x</h1>}
                      </div>
                      {item.discount_price !== 0 && (
                        <div className="w-full flex justify-between poppins-light text-xs mt-1">
                          <h1>
                            Rp{" "}
                            {Number(item.discount_price).toLocaleString(
                              "id-ID"
                            )}
                          </h1>
                          {item.discount_price !== 0 && <h1>{item.qty}x</h1>}
                        </div>
                      )}
                      <div className="w-full flex justify-between poppins-light text-xs mt-2">
                        <h1 className="poppins-medium">Subtotal</h1>
                        <h1>
                          Rp {Number(item.subtotal).toLocaleString("id-ID")}
                        </h1>
                      </div>
                      <div className="w-full flex justify-between poppins-light text-xs mt-2">
                        <h1 className="poppins-medium">Catatan</h1>
                        <h1>{item.note ? item.note : "-"}</h1>
                      </div>
                    </>
                  ))}
                </div>
                <div className="w-full flex flex-col border-b-[0.1px] pb-4">
                  <h1 className="poppins-bold mt-4">Detail Transaksi:</h1>
                  <div className="w-full flex justify-between poppins-light text-xs mt-2">
                    <h1>Jumlah Item</h1>
                    <h1>{jumlahItem}x</h1>
                  </div>
                  <div className="w-full flex justify-between poppins-light text-xs mt-2">
                    <h1 className="poppins-medium">Total Pembayaran</h1>
                    <h1>
                      Rp{" "}
                      {Number(dataOrders.total_price).toLocaleString("id-ID")}
                    </h1>
                  </div>
                  <div className="w-full flex justify-between poppins-light text-xs mt-2">
                    <h1 className="poppins-medium">
                      Bayar ({dataOrders.cash ? "Tunai" : "QRIS"}):
                    </h1>
                    <h1>
                      {dataOrders.cash
                        ? `Rp ${Number(dataOrders.cash).toLocaleString(
                            "id-ID"
                          )}`
                        : "Lunas"}
                    </h1>
                  </div>
                  <div className="w-full flex justify-between poppins-light text-xs mt-2">
                    <h1 className="poppins-medium">Kembalian</h1>
                    <h1>
                      Rp{" "}
                      {Number(
                        dataOrders.cash
                          ? dataOrders.cash - dataOrders.total_price
                          : 0
                      ).toLocaleString("id-ID")}
                    </h1>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={handleCapture}
              className="btn btn-soft mt-5 w-full lg:w-sm"
            >
              DOWNLOAD RECEIPT
            </button>
            <button
              onClick={handleShare}
              className="btn btn-soft mt-2 w-full lg:w-sm"
            >
              SHARE RECEIPT
            </button>
            <div className="modal-action w-full flex">
              <form method="dialog" className="w-full flex justify-center">
                {/* if there is a button, it will close the modal */}
                <button className="btn btn-accent w-full lg:w-sm">Close</button>
              </form>
            </div>
          </div>
        </dialog>
        <button className="btn w-full" onClick={handlePrint}>
          PRINT RECEIPT
        </button>
        <NavLink to="/" className="btn btn-accent w-full">
          BUAT PESANAN BARU
        </NavLink>
      </div>
    </>
  );
};

export default Transaction;
