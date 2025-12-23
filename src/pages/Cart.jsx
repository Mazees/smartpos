import Loading from "../components/Loading";
import { useContext, useEffect, useState } from "react";
import { CartContext } from "../contexts/CartContext";
import { getAllMenu, getAllMembers } from "../api/api";
import WarningModal from "../components/WarningModal";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cart, setCart } = useContext(CartContext);
  const [menu, setMenu] = useState([]);
  const [members, setMembers] = useState([]);
  const [totalHarga, setTotalHarga] = useState(0);
  const [jumlahItem, setJumlahItem] = useState(0);
  const [namaPelanggan, setNamaPelanggan] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    const { data: dataMenu, error: menuError } = await getAllMenu();
    const { data: dataMembers, error: membersError } = await getAllMembers();
    if (menuError) console.error(menuError);
    if (membersError) console.error(membersError);
    setMembers(dataMembers || []);
    setMenu(dataMenu || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    setTotalHarga(cart.reduce((total, item) => total + item.subtotal, 0));
    setJumlahItem(cart.reduce((total, item) => total + item.qty, 0));
    if (cart.length == 0) navigate("/");
  }, [cart]);

  useEffect(() => {
    console.log(members);
  }, [members]);

  const updateQty = (index, delta) => {
    setCart((prev) => {
      const prevItem = [...prev];
      prevItem[index].qty = Math.max(1, (prevItem[index].qty || 0) + delta);
      // Calculate active price: use discount_price if available and > 0, otherwise original_price
      const activePrice =
        prevItem[index].discount_price && prevItem[index].discount_price !== 0
          ? prevItem[index].discount_price
          : prevItem[index].original_price || 0;
      prevItem[index].subtotal = prevItem[index].qty * activePrice;
      return prevItem;
    });
  };

  const removeItem = (menuId) => {
    setCart((prev) => prev.filter((it) => (it.menu_id ?? it.id) != menuId));
  };

  return (
    <>
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center ">
          <Loading message="Memuat data keranjang..." />
        </div>
      ) : cart.length === 0 ? (
        <div className="p-6 text-center opacity-60">Keranjang kosong</div>
      ) : (
        <>
          <input
            type="text"
            className="input w-full lg:w-lg"
            placeholder="Nama Pelanggan (opsional)"
            list="members"
            value={namaPelanggan}
            onChange={(e) => setNamaPelanggan(e.target.value)}
          />
          <datalist id="members">
            {members.map((member) => (
              <option key={member.id} value={member.name} />
            ))}
          </datalist>
          <ul className="flex-1 overflow-y-auto">
            {cart.map((item, idx) => {
              const title = item.name;
              const activePrice =
                item.discount_price && item.discount_price !== 0
                  ? item.discount_price
                  : item.original_price;
              return (
                <li
                  onClick={() =>
                    navigate("/keranjang/detail-pesanan", {
                      state: {
                        idx: idx,
                        name: title,
                        menu_id: item.menu_id,
                        note: item.note,
                        qty: item.qty,
                        variants: item.variants,
                        original_price: item.original_price,
                        discount_price: item.discount_price,
                      },
                    })
                  }
                  key={item.menu_id ?? item.id}
                  className="p-4 gap-5 flex items-center border-b-[0.5px] active:bg-base-content/30 active:text-white hover:cursor-pointer"
                >
                  <div className="px-3 py-1 border rounded">{item.qty}</div>
                  <div className="flex flex-col justify-center">
                    <div className="poppins-medium text-[14px] poppins-bold">
                      {title}
                    </div>
                    <div className="poppins-medium text-xs flex flex-col gap-1 mt-1">
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
                  </div>
                  <div className="poppins-medium shrink-0 text-[14px] flex flex-col gap-2 items-center ml-auto">
                    <div>Rp {item.subtotal.toLocaleString("id-ID")}</div>
                  </div>
                </li>
              );
            })}
            <WarningModal modalId="my_modal_6" onConfirm={() => setCart([])} />
          </ul>
          <div className="w-full flex flex-col mt-auto not-lg:fixed lg:mb-5 not-lg:bottom-0 not-lg:left-0 not-lg:right-0 not-lg:bg-base-100 not-lg:p-5">
            <div className="flex justify-between w-full poppins-bold">
              <h1 className="">Total</h1>
              <h1 className="Total">Rp {totalHarga.toLocaleString("id-ID")}</h1>
            </div>
            <button
              onClick={() => {
                navigate("/keranjang/pembayaran", {
                  state: {
                    namaPelanggan: namaPelanggan,
                    jumlahItem: jumlahItem,
                    totalHarga: totalHarga,
                  },
                });
              }}
              className="btn btn-secondary w-full mt-5 poppins-bold active:brightness-80"
            >
              LANJUT PEMBAYARAN
            </button>
          </div>
        </>
      )}
    </>
  );
};

export default Cart;
