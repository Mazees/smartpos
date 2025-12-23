import Loading from "../components/Loading";
import Alert from "../components/Alert";
import { addMenu } from "../api/api";
import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/Breadcrumbs";
import { getAllMenu, getAllKategori } from "../api/api";
import supabase from "../api/supabase";
import { realtime } from "../api/api";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const Products = () => {
  const queryClient = useQueryClient();
  const {
    data: menuItems = [],
    isLoading: loading,
    isError: isErrorMenu,
    error: errorMenu,
  } = useQuery({ queryKey: ["menu"], queryFn: getAllMenu });
  const {
    data: kategoriItems = [],
    isLoading,
    isError: isKategoriError,
    error: errorKategori,
  } = useQuery({ queryKey: ["kategori"], queryFn: getAllKategori });
  const [notification, setNotification] = useState({
    message: "",
    variant: "warning",
  });
  const handleNotification = (message, variant) => {
    setNotification({ message, variant });
    setTimeout(() => setNotification({}), 2500);
  };
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState("");
  const menuItemsCopy = useMemo(() => {
    if (!menuItems) return [];
    let result = [...menuItems];
    if (searchTerm.trim() !== "") {
      const keyword = searchTerm.toLowerCase();
      result = result.filter((item) =>
        item.name.toLowerCase().includes(keyword)
      );
    }
    return result.sort((a, b) => b.price - a.price);
  }, [menuItems, searchTerm]);

  useEffect(() => {
    if (errorMenu) {
      console.error(errorMenu);
      handleNotification(
        `Error: ${errorMenu?.message ?? JSON.stringify(errorMenu)}`,
        "error"
      );
    }
    if (errorKategori) {
      console.error(errorKategori);
      handleNotification(
        `Error: ${errorKategori?.message ?? JSON.stringify(errorKategori)}`,
        "error"
      );
    }
    return realtime("menu", () => {
      queryClient.invalidateQueries({ queryKey: ["menu"] });
    });
  }, []);
  useEffect(() => {
    console.log(menuItems);
  }, [menuItems]);
  return (
    <>
      {notification.message && (
        <Alert message={notification.message} variant={notification.variant} />
      )}
      <button
        className="btn btn-circle btn-accent z-50 btn-lg fixed bottom-8 right-8"
        onClick={() => navigate("/kelola/daftar-menu/tambah-menu")}
      >
        +
      </button>
      {loading ? (
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loading message="Memuat menu..." />
        </div>
      ) : (
        <>
          <div className="py-4 opacity-60 tracking-wide">
            Semua Daftar Menu:
          </div>
          <label className="input not-lg:w-full mb-3">
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
              onInput={(e) => setSearchTerm(e.target.value)}
              placeholder="Search"
            />
          </label>
          {kategoriItems.map(
            (kategori, idxKategori) =>
              menuItemsCopy.filter(
                (filteredMenu) => filteredMenu.id_kategori === kategori.id
              ).length > 0 && (
                <ul
                  className="list bg-base-100 mt-3 border-b-[0.05px] border-b-accent/40 mx-2 py-4"
                  key={kategori.id}
                >
                  <h1 className="poppins-bold text-lg text-center w-full mb-1">
                    {kategori.name}
                  </h1>
                  {menuItemsCopy
                    .filter((menu) => menu.id_kategori === kategori.id)
                    .map((menu, idx) => (
                      <li
                        key={menu.id}
                        onClick={() =>
                          navigate("/kelola/daftar-menu/edit-menu", {
                            state: menu,
                          })
                        }
                        className="list-row flex items-center hover:bg-base-content/30 hover:text-white hover:cursor-pointer rounded-lg"
                      >
                        <div className="flex not-lg:flex-col lg:items-center lg:gap-3 gap-1">
                          <div className="poppins-medium text-[14px]">
                            {menu.name}
                          </div>
                          <div
                            className={`${
                              menu.status
                                ? "bg-[#00ff00] text-black"
                                : "bg-[#ff0000] text-white"
                            } text-[10px] uppercase poppins-regular opacity-60 w-fit h-fit rounded-sm p-1`}
                          >
                            {menu.status ? "Tersedia" : "Tidak Tersedia"}
                          </div>
                        </div>
                        <div className="poppins-medium text-[14px] ml-auto flex flex-col shrink-0">
                          <h1
                            className={`${
                              menu.discount_price == 0 ? "" : "line-through"
                            }`}
                          >{`Rp ${menu.price.toLocaleString("id-ID")}`}</h1>
                          <h1
                            className={`${
                              menu.discount_price == 0 ? "hidden" : ""
                            }`}
                          >{`Rp ${menu.discount_price.toLocaleString(
                            "id-ID"
                          )}`}</h1>
                        </div>
                      </li>
                    ))}
                </ul>
              )
          )}
          <ul className="list bg-base-100 mt-3 border-b-[0.05px] border-b-accent/40 mx-2 py-4">
            <h1 className="poppins-bold text-lg text-center w-full mb-1">
              Semua Menu
            </h1>
            {menuItemsCopy.map((menu, idx) => (
              <li
                onClick={() =>
                  navigate("/kelola/daftar-menu/edit-menu", {
                    state: menuItemsCopy[idx],
                  })
                }
                className="list-row flex items-center hover:bg-base-content/30 hover:text-white hover:cursor-pointer rounded-lg"
              >
                <div className="flex not-lg:flex-col lg:items-center lg:gap-3 gap-1">
                  <div className="poppins-medium text-[14px]">{menu.name}</div>
                  <div
                    className={`${
                      menu.status
                        ? "bg-[#00ff00] text-black"
                        : "bg-[#ff0000] text-white"
                    } text-[10px] uppercase poppins-regular opacity-60 w-fit h-fit rounded-sm p-1`}
                  >
                    {menu.status ? "Tersedia" : "Tidak Tersedia"}
                  </div>
                </div>
                <div className="poppins-medium text-[14px] ml-auto flex flex-col shrink-0">
                  <h1
                    className={`${
                      menu.discount_price == 0 ? "" : "line-through"
                    }`}
                  >{`Rp ${menu.price.toLocaleString("id-ID")}`}</h1>
                  <h1
                    className={`${menu.discount_price == 0 ? "hidden" : ""}`}
                  >{`Rp ${menu.discount_price.toLocaleString("id-ID")}`}</h1>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
};

export default Products;
