import { useState, useEffect, useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getAllReadyMenu, getAllKategori } from "../api/api";
import { realtime } from "../api/api";
import Loading from "../components/Loading";
import Header from "../components/Header";
import Breadcrumbs from "../components/Breadcrumbs";
import { CartContext } from "../contexts/CartContext";
import Alert from "../components/Alert";

const Orders = () => {
  const [kategori, setKategori] = useState([]);
  const { cart, setCart } = useContext(CartContext);
  const [manualPrice, setManualPrice] = useState("");
  const [manualNote, setManualNote] = useState("");
  const navigate = useNavigate();
  const [totalHarga, setTotalHarga] = useState(0);
  const [jumlahItem, setJumlahItem] = useState(0);
  const [menu, setMenu] = useState([]);
  const [defaultChecked, setDefaultChecked] = useState(true);
  const [menuCopy, setMenuCopy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });
  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 1500);
  };
  const loadData = async () => {
    setLoading(true);
    const { data: dataMenu, error: menuError } = await getAllReadyMenu();
    const { data: dataKategori, error: kategoriError } = await getAllKategori();
    if (menuError) console.error(menuError);
    if (kategoriError) console.error(kategoriError);
    setKategori(dataKategori || []);
    setMenu(dataMenu || []);
    setLoading(false);
    console.log({ dataKategori, dataMenu });
  };

  useEffect(() => {
    setMenuCopy([...menu]);
  }, [menu]);
  useEffect(() => {
    console.log(cart);
    setTotalHarga(cart.reduce((total, item) => total + item.subtotal, 0));
    setJumlahItem(cart.reduce((total, item) => total + item.qty, 0));
  }, [cart]);

  useEffect(() => {
    loadData();
    const unsubMenu = realtime("menu", loadData);
    const unsubKategori = realtime("kategori", loadData);
    return () => {
      unsubMenu();
      unsubKategori();
    };
  }, []);

  const handleClickCart = () => {
    navigate("/keranjang");
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
    <Header title="Buat Pesanan">
      <Alert message={notification.message} variant={notification.variant} />
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loading message="Memuat menu..." />
        </div>
      ) : (
        <>
          <div className="tabs tabs-box">
            <input
              type="radio"
              name="my_tabs_1"
              className="tab w-1/2"
              aria-label="Daftar Menu"
              defaultChecked
              onChange={() => setDefaultChecked(true)}
            />
            <input
              type="radio"
              name="my_tabs_1"
              className="tab w-1/2"
              aria-label="Pesanan Manual"
              onChange={() => setDefaultChecked(false)}
            />
          </div>
          {defaultChecked ? (
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
              {kategori.map(
                (kat, idxKategori) =>
                  menuCopy.filter((menu) => menu.id_kategori === kat.id)
                    .length > 0 && (
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
                            onClick={() => handleAddToCart(menu)}
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
                                      menu.discount_price == 0
                                        ? ""
                                        : "line-through"
                                    }`}
                                  >{` ${menu.price.toLocaleString(
                                    "id-ID"
                                  )}`}</span>
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
                              {(cart.findIndex(
                                (item) => item.menu_id == menu.id
                              ) !== -1 &&
                                cart[
                                  cart.findIndex(
                                    (item) => item.menu_id == menu.id
                                  )
                                ].qty) ||
                                ""}
                            </div>
                          </li>
                        ))}
                    </ul>
                  )
              )}
              <ul className="list bg-base-100 mt-3 border-b-[0.05px] border-b-accent/40 py-4">
                <h1 className="poppins-medium w-full mb-1">
                  Semua Menu:
                </h1>
                {menuCopy.map((menu, idx) => (
                  <li
                    key={menu.id || idx}
                    onClick={() => handleAddToCart(menu)}
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
                      {(cart.findIndex((item) => item.menu_id == menu.id) !==
                        -1 &&
                        cart[cart.findIndex((item) => item.menu_id == menu.id)]
                          .qty) ||
                        ""}
                    </div>
                  </li>
                ))}
              </ul>
            </>
          ) : (
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
        </>
      )}
    </Header>
  );
};

export default Orders;
