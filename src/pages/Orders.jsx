import { useState, useEffect, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  getAllReadyMenu,
  getAllKategori,
  getAllVariant,
  getVariantByIdMenu,
} from "../api/api";
import { realtime } from "../api/api";
import Loading from "../components/Loading";
import Breadcrumbs from "../components/Breadcrumbs";
import { CartContext } from "../contexts/CartContext";
import Alert from "../components/Alert";
import { fetchAI } from "../api/ai";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ConfirmSelect from "../components/ConfirmSelect";

const Orders = () => {
  const queryClient = useQueryClient();
  const [selectState, setSelectState] = useState({
    isOpen: false,
    menu: null,
    variants: [],
  });
  const { cart, setCart } = useContext(CartContext);
  const [manualPrice, setManualPrice] = useState("");
  const [manualNote, setManualNote] = useState("");
  const navigate = useNavigate();
  const [totalHarga, setTotalHarga] = useState(0);
  const [jumlahItem, setJumlahItem] = useState(0);
  const {
    data: kategori = [],
    isLoading,
    isError: isKategoriError,
    error: kategoriError,
  } = useQuery({ queryKey: ["kategori"], queryFn: getAllKategori });
  const {
    data: variants = [],
    isLoading: isLoadingVariants,
    isError: isVariantsError,
    error: varianError,
  } = useQuery({ queryKey: ["variants"], queryFn: getAllVariant });
  const {
    data: menu = [],
    isLoading: loading,
    isError: isMenuError,
    error: menuError,
  } = useQuery({ queryKey: ["readyMenu"], queryFn: getAllReadyMenu });
  const [page, setPage] = useState(0);
  const [menuCopy, setMenuCopy] = useState([]);
  const [smartOrder, setSmartOrder] = useState();
  const [loadingSmartOrder, setLoadingSmartOrder] = useState(false);
  const [smartOrderError, setSmartOrderError] = useState("");
  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });
  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 2500);
  };
  const handleSmartOrder = async (e) => {
    e.preventDefault();
    setLoadingSmartOrder(true);
    const { isError, msg, data: result } = await fetchAI(smartOrder);
    if (isError) {
      setSmartOrderError(msg);
      setLoadingSmartOrder(false);
      return;
    }
    if (result.error) {
      setSmartOrder(result.error);
      setLoadingSmartOrder(false);
      return;
    }
    setSmartOrderError("");
    setCart(result.result);
    navigate("/keranjang");
    setLoadingSmartOrder(false);
  };

  useEffect(() => {
    if (!menu) return [];
    setMenuCopy([...menu].sort((a, b) => b.price - a.price));
  }, [menu]);
  useEffect(() => {
    console.log(cart);
    setTotalHarga(cart.reduce((total, item) => total + item.subtotal, 0));
    setJumlahItem(cart.reduce((total, item) => total + item.qty, 0));
  }, [cart]);

  useEffect(() => {
    const unsubMenu = realtime("menu", () => {
      queryClient.invalidateQueries({ queryKey: ["readyMenu"] });
    });
    const unsubKategori = realtime("kategori", () => {
      queryClient.invalidateQueries({ queryKey: ["kategori"] });
    });
    return () => {
      unsubMenu();
      unsubKategori();
    };
  }, []);

  const handleClickCart = () => {
    navigate("/keranjang");
  };

  const handleClickItem = async (menu) => {
    const variantMenu = await getVariantByIdMenu(menu.id);
    setSelectState({
      isOpen: true,
      menu: menu,
      variants: variants.filter((variant) =>
        variantMenu.some((itemMenu) => itemMenu.id_variant === variant.id)
      ),
    });
  };

  const handleAddToCart = (menu) => {
    setCart((prev) => {
      const prevItem = [...prev];
      const newIndex = prevItem.findIndex((item) => item.menu_id == menu.id);
      if (newIndex !== -1) {
        prevItem[newIndex].qty += 1;
        const activePrice =
          prevItem[newIndex].discount_price &&
          prevItem[newIndex].discount_price !== 0
            ? prevItem[newIndex].discount_price
            : prevItem[newIndex].original_price;
        prevItem[newIndex].subtotal = prevItem[newIndex].qty * activePrice;
        return prevItem;
      } else {
        return [
          ...prev,
          {
            menu_id: menu.id,
            name: menu.name,
            original_price: menu.price,
            discount_price: menu.discount_price || 0,
            qty: 1,
            note: "",
            subtotal:
              menu.discount_price && menu.discount_price !== 0
                ? menu.discount_price
                : menu.price,
          },
        ];
      }
    });
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const priceManual = Number(manualPrice);
    setCart((prev) => [
      ...prev,
      {
        menu_id: -1,
        name: "Pesanan Manual",
        original_price: priceManual,
        discount_price: 0,
        qty: 1,
        note: manualNote,
        subtotal: priceManual,
      },
    ]);
    setManualPrice("");
    setManualNote("");
    handleNotification("Pesanan manual berhasil ditambahkan", "success");
  };

  return (
    <>
      <ConfirmSelect selectState={selectState} onClose={() => setSelectState({ isOpen: false, menu: null, variants: [] })}/>
      <Alert message={notification.message} variant={notification.variant} />
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loading message="Memuat menu..." />
        </div>
      ) : isMenuError ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-6 bg-error/10 rounded-lg border border-error/30 max-w-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 text-error"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h2 className="poppins-bold text-xl text-error">
              Gagal Memuat Menu
            </h2>
            <p className="poppins-regular text-center text-base-content/70">
              {menuError?.message || "Terjadi kesalahan saat memuat data menu"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-error btn-outline mt-2"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="tabs tabs-box flex-nowrap overflow-x-scroll scrollbar-hidden p-1">
            <input
              type="radio"
              name="my_tabs_1"
              className="tab flex-1 w-10"
              aria-label="Daftar Menu"
              checked={page === 0}
              onChange={() => setPage(0)}
            />
            <input
              type="radio"
              name="my_tabs_1"
              className="tab flex-1 w-10"
              aria-label="Pesanan Manual"
              checked={page === 1}
              onChange={() => setPage(1)}
            />
            <input
              type="radio"
              name="my_tabs_1"
              className="tab flex-1 w-10"
              aria-label="SmartOrder (AI)"
              checked={page === 2}
              onChange={() => setPage(2)}
            />
          </div>
          {page === 0 && (
            <>
              <div className="py-4 opacity-60 tracking-wide poppins-regular">
                Semua Daftar Menu:
              </div>
              <div className="flex border rounded-lg w-lg not-lg:w-full poppins-regular">
                <select
                  onChange={(e) => {
                    const kategoriId = e.target.value;
                    if (kategoriId === "-1") {
                      setMenuCopy([...menu]);
                      return;
                    }
                    setMenuCopy(
                      menu.filter((item) => item.id_kategori == kategoriId)
                    );
                  }}
                  className="select outline-none border-none shadow-none appearance-none focus:outline-none not-lg:w-full poppins-regular"
                >
                  <option value="-1">Semua Kategori</option>
                  {kategori.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama_kategori ?? item.name ?? `#${item.id}`}
                    </option>
                  ))}
                </select>
                <label className="input outline-none border-none shadow-none not-lg:w-full poppins-regular">
                  <svg
                    className="h-[1em] opacity-50"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                  >
                    <g
                      strokeLinejoin="round"
                      strokeLinecap="round"
                      strokeWidth="2.5"
                      fill="none"
                      stroke="currentColor"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.3-4.3"></path>
                    </g>
                  </svg>
                  <input
                    type="search"
                    onInput={(e) =>
                      setMenuCopy(
                        menu.filter((item) =>
                          item.name
                            .toLowerCase()
                            .includes(e.target.value.toLowerCase())
                        )
                      )
                    }
                    placeholder="Search"
                  />
                </label>
              </div>
              <div
                className={`text-white fixed bottom-1 p-3 right-0 lg:w-fit w-full justify-end z-50 ${
                  cart.length == 0 ? "hidden" : "flex"
                }`}
              >
                <button
                  onClick={handleClickCart}
                  className="lg:hidden bg-base-content active:bg-base-200 transition-all active:text-base-content w-full p-3 rounded-lg flex items-center gap-3 justify-start poppins-bold"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 4a1 1 0 0 1 1-1h1.5a1 1 0 0 1 .979.796L7.939 6H19a1 1 0 0 1 .979 1.204l-1.25 6a1 1 0 0 1-.979.796H9.605l.208 1H17a3 3 0 1 1-2.83 2h-2.34a3 3 0 1 1-4.009-1.76L5.686 5H5a1 1 0 0 1-1-1Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {jumlahItem} Items
                  <h1 className="ml-auto">
                    Rp {totalHarga.toLocaleString("id-ID")}
                  </h1>
                </button>
                <button
                  onClick={handleClickCart}
                  className="not-lg:hidden hover:cursor-pointer bg-base-content active:bg-base-200 transition-all active:text-base-content w-fit p-3 rounded-lg flex items-center gap-3 justify-start poppins-bold"
                >
                  <svg
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M4 4a1 1 0 0 1 1-1h1.5a1 1 0 0 1 .979.796L7.939 6H19a1 1 0 0 1 .979 1.204l-1.25 6a1 1 0 0 1-.979.796H9.605l.208 1H17a3 3 0 1 1-2.83 2h-2.34a3 3 0 1 1-4.009-1.76L5.686 5H5a1 1 0 0 1-1-1Z"
                      clip-rule="evenodd"
                    />
                  </svg>
                  {jumlahItem} Items
                </button>
              </div>
              {kategori.map((kat, idxKategori) => (
                <ul
                  className="list bg-base-100 mt-3 border-b-[0.05px] border-b-accent/40 py-4"
                  key={kat.id || idxKategori}
                >
                  <h1 className="poppins-medium w-full mb-1">
                    {kat.nama_kategori || kat.name}:
                  </h1>
                  {menuCopy
                    .filter((menu) => menu.id_kategori === kat.id)
                    .map((menu, idx) => (
                      <li
                        key={menu.id || idx}
                        onClick={() => handleClickItem(menu)}
                        className="p-4 gap-2 flex items-center list-row active:bg-base-content/30 active:text-white hover:cursor-pointer"
                      >
                        <div className="w-10 h-10 flex justify-center items-center poppins-bold bg-base-content rounded-lg text-base-300">
                          {menu.name
                            .split(" ")
                            .slice(0, 2)
                            .map((item) => item[0])}
                        </div>
                        <div className="flex flex-col justify-center">
                          <div className="poppins-medium text-[14px] poppins-bold">
                            {menu.name}
                          </div>
                          <div className="poppins-medium text-[14px] flex gap-1">
                            <h1>
                              Rp{" "}
                              <span
                                className={`${
                                  menu.discount_price == 0 ? "" : "line-through"
                                }`}
                              >{` ${menu.price.toLocaleString("id-ID")}`}</span>
                            </h1>
                            <h1
                              className={`${
                                menu.discount_price == 0 ? "hidden" : ""
                              }`}
                            >{`${menu.discount_price.toLocaleString(
                              "id-ID"
                            )}`}</h1>
                          </div>
                        </div>
                        <div
                          className={`poppins-bold bg-base-300 ml-auto w-5 h-5 text-xs opacity-50 ${
                            cart.findIndex(
                              (item) => item.menu_id == menu.id
                            ) !== -1
                              ? "flex"
                              : "hidden"
                          } justify-center items-center rounded-[5px]`}
                        >
                          {cart.findIndex((item) => item.menu_id == menu.id) !==
                            -1 &&
                            cart.reduce((sum, item) => {
                              if (item.menu_id == menu.id)
                                return sum + item.qty;
                              return sum;
                            }, 0)}
                        </div>
                      </li>
                    ))}
                </ul>
              ))}
              <ul className="list bg-base-100 mt-3 border-b-[0.05px] border-b-accent/40 py-4">
                <h1 className="poppins-medium w-full mb-1">Semua Menu:</h1>
                {menuCopy.map((menu, idx) => (
                  <li
                    key={menu.id || idx}
                    onClick={() => handleClickItem(menu)}
                    className="p-4 gap-2 flex items-center list-row active:bg-base-content/30 active:text-white hover:cursor-pointer"
                  >
                    <div className="w-10 h-10 flex justify-center items-center poppins-bold bg-base-content rounded-lg text-base-300">
                      {menu.name
                        .split(" ")
                        .slice(0, 2)
                        .map((item) => item[0])}
                    </div>
                    <div className="flex flex-col justify-center">
                      <div className="poppins-medium text-[14px] poppins-bold">
                        {menu.name}
                      </div>
                      <div className="poppins-medium text-[14px] flex gap-1">
                        <h1>
                          Rp{" "}
                          <span
                            className={`${
                              menu.discount_price == 0 ? "" : "line-through"
                            }`}
                          >{` ${menu.price.toLocaleString("id-ID")}`}</span>
                        </h1>
                        <h1
                          className={`${
                            menu.discount_price == 0 ? "hidden" : ""
                          }`}
                        >{`${menu.discount_price.toLocaleString("id-ID")}`}</h1>
                      </div>
                    </div>
                    <div
                      className={`poppins-bold bg-base-300 ml-auto w-5 h-5 text-xs opacity-50 ${
                        cart.findIndex((item) => item.menu_id == menu.id) !== -1
                          ? "flex"
                          : "hidden"
                      } justify-center items-center rounded-[5px]`}
                    >
                      {cart.findIndex((item) => item.menu_id == menu.id) !==
                        -1 &&
                        cart.reduce((sum, item) => {
                          if (item.menu_id == menu.id) return sum + item.qty;
                          return sum;
                        }, 0)}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {page === 1 && (
            <form
              className="flex flex-col w-full py-5"
              onSubmit={handleManualSubmit}
            >
              <h1 className="poppins-bold text-lg">Pesanan Manual</h1>
              <fieldset className="fieldset w-full max-w-lg">
                <legend className="fieldset-legend poppins-regular">
                  Tambahkan Pesanan Manual:
                </legend>
                <input
                  type="number"
                  className="input w-full"
                  placeholder="Harga"
                  value={manualPrice}
                  required
                  onChange={(e) => setManualPrice(e.target.value)}
                />
                <input
                  type="text"
                  required
                  className="input w-full"
                  placeholder="Catatan"
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                />
                <p className="label">
                  Contoh: Ongkos kirim/biaya lainnya yang tidak termasuk menu
                </p>
                <button type="submit" className="btn mt-2">
                  Tambahkan
                </button>
              </fieldset>
            </form>
          )}
          {page === 2 && (
            <div className="flex flex-col mx-auto w-full justify-center pt-4 opacity-50 poppins-regular">
              <h1 className="poppins-bold text-lg">SMART-ORDER</h1>
              <h2 className="poppins-regular text-sm mb-3">
                Fitur Pesanan Berbasis AI
              </h2>
              <form className="flex flex-col" onSubmit={handleSmartOrder}>
                <textarea
                  className="textarea w-full lg:w-lg"
                  placeholder="Masukkan Pesanan/Tempelkan Pesanan Disini"
                  required
                  value={smartOrder}
                  onChange={(e) => {
                    setSmartOrder(e.target.value);
                  }}
                ></textarea>
                {smartOrderError ? (
                  <p className="poppins-regular-italic text-sm mt-3 lg:w-lg w-full text-red-600 flex flex-row">
                    ✦ {smartOrderError}
                  </p>
                ) : (
                  ""
                )}
                <button
                  type="submit"
                  disabled={loadingSmartOrder}
                  className="btn lg:w-lg w-full mt-5 poppins-bold"
                >
                  {loadingSmartOrder ? "Loading..." : "PESAN SEKARANG"}
                </button>
              </form>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default Orders;
