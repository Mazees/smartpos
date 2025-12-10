import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { CartContext } from "../contexts/CartContext";
import { useContext } from "react";
import WarningModal from "../components/WarningModal";

const DetailOrders = () => {
  const { cart, setCart } = useContext(CartContext);
  const isFirst = useRef(true);
  const navigate = useNavigate();
  const location = useLocation();
  const [dataOrder, setDataOrder] = useState(location.state || null);
  const [quantity, setQuantity] = useState(dataOrder.qty);
  const [notes, setNotes] = useState(dataOrder.note);
  const [indexCart, setIndexCart] = useState(dataOrder.idx);
  const updateHandle = () => {
    setCart((prev) => {
      const updated = [...prev];
      const activePrice =
        dataOrder.discount_price && dataOrder.discount_price !== 0
          ? dataOrder.discount_price
          : dataOrder.original_price;
      updated[indexCart] = {
        ...updated[indexCart],
        qty: quantity,
        note: notes,
        subtotal: quantity * activePrice,
      };
      return updated;
    });
  };
  useEffect(() => {
    if (quantity <= 0) {
      setQuantity(1);
    }
  }, [quantity]);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return; // skip efek pertama kali
    }
    if (cart.length == 0) {
      navigate("/");
    } else {
      navigate(-1);
    }
  }, [cart]);
  return (
    <Header title="Detail Pesanan">
      {dataOrder ? (
        <>
          <h1 className="poppins-bold text-xl mt-5">{dataOrder.name}</h1>
          <p className="poppins-regular text-sm">
            Rp{" "}
            {(dataOrder.discount_price && dataOrder.discount_price !== 0
              ? dataOrder.discount_price
              : dataOrder.original_price
            )?.toLocaleString("id-ID")}
          </p>
          <fieldset className="fieldset w-full">
            <legend className="fieldset-legend poppins-regular">
              Tambahkan Catatan:
            </legend>
            <textarea
              className="textarea h-24 w-full resize-none"
              placeholder="Catatan"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
            <div className="label">Contoh: pedas/tidak pedas, tanpa sayur</div>
          </fieldset>
          <div className="flex items-center justify-between w-full rounded-lg border p-1">
            <button
              className="btn"
              onClick={() => setQuantity((prev) => prev - 1)}
            >
              -
            </button>
            <input
              className="poppins-bold w-full text-center outline-none"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
            />
            <button
              className="btn"
              onClick={() => setQuantity((prev) => prev + 1)}
            >
              +
            </button>
          </div>
          <WarningModal
            title="Hapus Pesanan"
            message="Apakah Anda yakin ingin menghapus pesanan ini?"
            modalId="my_modal_6"
            onConfirm={async () => {
              setCart((prev) => prev.filter((_, i) => i !== indexCart));
            }}
          >
            <span className="btn btn-error text-white w-full mt-5">
              HAPUS PESANAN
            </span>
          </WarningModal>
          <button className="btn w-full mt-5" onClick={updateHandle}>
            SIMPAN
          </button>
        </>
      ) : (
        <div className="p-6 text-center opacity-60">Keranjang kosong</div>
      )}
    </Header>
  );
};

export default DetailOrders;
